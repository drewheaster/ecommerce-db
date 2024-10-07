// The `/api/products` endpoint
const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Tag, through: ProductTag, as: 'product_tags' },
      ],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Tag, through: ProductTag, as: 'product_tags' },
      ],
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(product); // Use 201 status for created resource
  } catch (err) {
    console.log(err); // Consider modifying this for production
    res.status(400).json(err);
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (!updated) {
      return res.status(404).json({ message: 'No product found with this id!' });
    }

    // Check for tag updates
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      // create filtered list of new tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });

      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    res.status(200).json({ message: 'Product updated successfully!' });
  } catch (err) {
    console.log(err); // Consider modifying this for production
    res.status(400).json(err);
  }
});

// delete product
router.delete('/:id', async (req, res) => {
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;