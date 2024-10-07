// The `/api/categories` endpoint
const router = require('express').Router();
const { Category, Product, Tag } = require('../../models');

// get all categories
router.get('/', async (req, res) => {
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }] // Include products directly
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one category
router.get('/:id', async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }] // Include products directly
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create a new category
router.post('/', async (req, res) => {
  try {
    const categoryData = await Category.create(req.body);
    res.status(201).json(categoryData); // Use 201 status for created resource
  } catch (err) {
    res.status(400).json(err);
  }
});

// update a category
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Category.update(
      {
        category_name: req.body.category_name,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    if (updated === 0) { // Check if the update was made
      return res.status(404).json({ message: 'No category found with this id!' });
    }

    res.status(200).json({ message: 'Category updated successfully!' });
  } catch (err) {
    res.status(400).json(err);
  }
});

// delete a category
router.delete('/:id', async (req, res) => {
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    }

    res.status(200).json({ message: 'Category deleted successfully!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;