'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Tag = require('../models/tag');

const Note = require('../models/note');//Modified

/* ========== GET/READ ALL ITEMS ========== */
router.get('/tags', (req, res, next) => {

  Tag.find()
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
  
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/tags/:id', (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  Tag.findById(id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});
  
  
/* ========== POST/CREATE AN ITEM ========== */
router.post('/tags', (req, res, next) => {
  const { name } = req.body;
    
  /***** Never trust users - validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
    
  const newItem = { name };
    
  Tag.create(newItem)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});
  
  
/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/tags/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
    
  /***** Never trust users - validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
    
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
    
  const updateItem = { name };
  const options = { new: true };
    
  Tag.findByIdAndUpdate(id, updateItem, options)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});
  
  
/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/tags/:id', (req, res, next) => {
  // const { id } = req.params;
    
  // Tag.findByIdAndRemove(id)
  //   .then(() => {

  //     Note.update({}, 
  //       { $pull: {tags : id} },
  //       { multi: true }
  //     );
  //     res.status(204).end();
  //   })
  //   .catch(err => {
  //     next(err);
  //   });

  const { id } = req.params;
  const tagRemovePromise = Tag.findByIdAndRemove(id);
  // const tagRemovePromise = Tag.remove({ _id: id }); // NOTE **underscore** _id

  const noteUpdatePromise = Note.updateMany(
    { 'tags': id, },
    { '$pull': { 'tags': id } }
  );

  Promise.all([tagRemovePromise, noteUpdatePromise])
    .then(([tagResult]) => {
      if (tagResult) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => {
      next(err); });
});
  

module.exports = router;