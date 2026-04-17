import Resource from '../models/Resource.js';

export const getResources = async (req, res) => {
  const resources = await Resource.find({});
  res.json(resources);
};

export const createResource = async (req, res) => {
  const { name, type, department, totalQuantity } = req.body;
  const resource = new Resource({
    name, type, department, totalQuantity, availableQuantity: totalQuantity
  });
  const createdResource = await resource.save();
  req.io.emit('resource-updated', createdResource);
  res.status(201).json(createdResource);
};

export const updateResource = async (req, res) => {
  const { id } = req.params;
  const { availableQuantity } = req.body;
  const resource = await Resource.findById(id);
  
  if (resource) {
    resource.availableQuantity = availableQuantity;
    if (availableQuantity === 0) resource.status = 'Critical';
    else if (availableQuantity < resource.totalQuantity * 0.2) resource.status = 'Low';
    else resource.status = 'Available';

    const updatedResource = await resource.save();
    req.io.emit('resource-updated', updatedResource);
    res.json(updatedResource);
  } else {
    res.status(404).json({ message: 'Resource not found' });
  }
};

export const deleteResource = async (req, res) => {
  const { id } = req.params;
  const resource = await Resource.findByIdAndDelete(id);

  if (resource) {
    req.io.emit('resource-deleted', id);
    res.json({ message: 'Resource removed' });
  } else {
    res.status(404).json({ message: 'Resource not found' });
  }
};
