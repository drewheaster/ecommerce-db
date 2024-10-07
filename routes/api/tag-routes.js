// The `/api/tags` endpoint
const router = require('express').Router(); 
const { Tag, Product, ProductTag } = require('../../models');

// get all tags
router.get('/', async (req, res) => {
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product, through: ProductTag, as: 'product_tags' }] // Include products associated with tags
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one tag
router.get('/:id', async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag, as: 'product_tags' }] // Include products associated with tags
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new tag
router.post('/', async (req, res) => {
  try {
    // Validate request body
    if (!req.body.tag_name) {
      return res.status(400).json({ message: 'Tag name is required!' });
    }

    const tagData = await Tag.create(req.body);
    res.status(201).json(tagData); // Use 201 status for created resource
  } catch (err) {
    res.status(400).json(err);
  }
});

// update tag
router.put('/:id', async (req, res) => {
  try {
    // Validate request body
    if (!req.body.tag_name) {
      return res.status(400).json({ message: 'Tag name is required!' });
    }

    const [updated] = await Tag.update(
      {
        tag_name: req.body.tag_name
      },
      {
        where: {
          id: req.params.id
        }
      }
    );

    if (!updated) {
      return res.status(404).json({ message: 'No tag found with this id!' });
    }

    res.status(200).json({ message: 'Tag updated successfully!' });
  } catch (err) {
    res.status(400).json(err);
  }
});

// delete tag
router.delete('/:id', async (req, res) => {
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json({ message: 'Tag deleted successfully!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
