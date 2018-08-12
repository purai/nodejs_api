const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const uuidv1 = require('uuid/v1');
const helpers = require('../helpers/PurAiHelpers');
const func = require('../helpers/convertToNestedHelper.js');
var validate = require('uuid-validate');

router.get('/:status?/:uuid?/:search?/:page?/:limit?', function (req, res, next) {

    if (req.query.uuid != undefined && !validate(req.query.uuid)) {
        res.json({
            message: 'Categories cannot be returned. Check details message for more info',
            details: 'UUID format is invalid'
        });
        return;
    }

    Category.getCategories(req.query.status, req.query.uuid, req.query.search, req.query.page, req.query.limit, function (err, rows) {
        if (err) {
            res.json({
                message: 'Categories cannot be returned. Check details message for more info',
                details: err.sqlMessage
            });
        } else {
            res.json({
                categories: rows
            });
        }
    });

});

router.post('/', function (req, res, next) {

    const newUuid = uuidv1();

    Category.postCategory(req.body, newUuid, function (err, count) {
        if (err) {
            res.json({
                message: 'Category cannot be register. Check details message for more info',
                details: err.sqlMessage
            });
        } else {
            res.json({
                message: 'Category successfully registered',
                details: 'New UUID: ' + newUuid
            });
        }
    });

});

router.delete('/:uuid', function (req, res, next) {

    if (req.params.uuid != undefined && !validate(req.params.uuid)) {
        res.json({
            message: 'Categories cannot be deleted. Check details message for more info',
            details: 'UUID format is invalid'
        });
        return;
    }

    Category.deleteCategory(req.params.uuid, function (err, count) {
        if (err) {
            res.json({
                message: 'Category cannot be remove. Check details message for more info',
                details: err
            });
        } else if (count.affectedRows == 0) {
            res.json({
                message: 'Category cannot be remove. Check details message for more info',
                details: 'Category ' + req.params.uuid + ' not found'
            });
        } else {
            res.json({
                message: 'Category successfully removed',
                details: 'Affected rows ' + count.affectedRows
            });
        }
    });

});

router.put('/:uuid', function (req, res, next) {

    if (req.params.uuid != undefined && !validate(req.params.uuid)) {
        res.json({
            message: 'Categories cannot be updated. Check details message for more info',
            details: 'UUID format is invalid'
        });
        return;
    }

    Category.putCategory(req.params.uuid, req.body, function (err, rows) {
        if (err) {
            res.json({
                message: 'Category cannot be register. Check details message for more info',
                details: err.sqlMessage
            });
        } else {
            res.json({
                message: 'Category successfully updated',
                details: rows
            });
        }
    });

});

module.exports = router;