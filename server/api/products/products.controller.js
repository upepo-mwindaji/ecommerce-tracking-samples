/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/productss              ->  index
 * POST    /api/productss              ->  create
 * GET     /api/productss/:sku          ->  show
 * PUT     /api/productss/:id          ->  update
 * DELETE  /api/productss/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Products from './products.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Productss
export function index(req, res) {
  return Products.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Products from the DB
export function show(req, res) {
  console.log('request')
  return Products.find({ 'sku': req.params.sku }).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function categories(req, res) {
  return Products.find().distinct('category').exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Categories from the DB
export function category(req, res) {
    return Products.find({ category: req.params.name }).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Products in the DB
export function create(req, res) {
  return Products.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Products in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Products.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Products from the DB
export function destroy(req, res) {
  return Products.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
