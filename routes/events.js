const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const uuidv1 = require('uuid/v1');
const helpers = require('../helpers/PurAiHelpers');
const func = require('../helpers/convertToNestedHelper.js');
var validate = require('uuid-validate');

router.get('/:saleplace?/:category?/:upcoming?/:status?/:uuid?/:search?/:page?/:limit?', function (req, res, next) {

    if (req.query.uuid != undefined && !validate(req.query.uuid)) {
        res.json({
            message: 'Events cannot be returned. Check details message for more info',
            details: 'UUID format is invalid'
        });
        return;
    }

    Event.getEvents(req.query.saleplace, req.query.category, req.query.upcoming, req.query.status, req.query.uuid, req.query.search, req.query.page, req.query.limit, function (err, rows) {
        if (err) {
            res.json({
                message: 'Events cannot be returned. Check details message for more info',
                details: err.sqlMessage
            });
        } else {
            var nestingOptions = [{
                    tableName: 'event',
                    pkey: 'id',
                    fkeys: [{
                            table: 'category',
                            col: 'id_category'
                        },
                        {
                            table: 'sale_place',
                            col: 'id_sale_place'
                        }
                    ]
                },
                {
                    tableName: 'category',
                    pkey: 'id'
                },
                {
                    tableName: 'sale_place',
                    pkey: 'id'
                },
            ];

            const nestedRows = func.convertToNested(rows, nestingOptions);
            res.json({
                events: nestedRows
            });
        }
    });

});

router.post('/', function (req, res, next) {

    const newUuid = uuidv1();
    const placePhoneNumberFormatted = helpers.formatPhoneNumber(req.body.place_phone);

    Event.postEvent(req.body, newUuid, placePhoneNumberFormatted, function (err, count) {
        if (err) {
            res.json({
                message: 'Event cannot be register. Check details message for more info',
                details: err.sqlMessage
            });
        } else {
            res.json({
                message: 'Event successfully registered',
                details: 'New UUID: ' + newUuid
            });
        }
    });

});

router.delete('/:uuid', function (req, res, next) {

    if (req.params.uuid != undefined && !validate(req.params.uuid)) {
        res.json({
            message: 'Events cannot be deleted. Check details message for more info',
            details: 'UUID format is invalid'
        });
        return;
    }

    Event.deleteEvent(req.params.uuid, function (err, count) {
        if (err) {
            res.json({
                message: 'Event cannot be remove. Check details message for more info',
                details: err
            });
        } else if (count.affectedRows == 0) {
            res.json({
                message: 'Event cannot be remove. Check details message for more info',
                details: 'Event ' + req.params.uuid + ' not found'
            });
        } else {
            res.json({
                message: 'Event successfully removed',
                details: 'Affected rows ' + count.affectedRows
            });
        }
    });

});

router.put('/:uuid', function (req, res, next) {

    if (req.params.uuid != undefined && !validate(req.params.uuid)) {
        res.json({
            message: 'Events cannot be updated. Check details message for more info',
            details: 'UUID format is invalid'
        });
        return;
    }

    const placePhoneNumberFormatted = helpers.formatPhoneNumber(req.body.place_phone);

    Event.putEvent(req.params.uuid, placePhoneNumberFormatted, req.body, function (err, rows) {
        if (err) {
            res.json({
                message: 'Event cannot be register. Check details message for more info',
                details: err.sqlMessage
            });
        } else {
            res.json({
                message: 'Event successfully updated',
                details: rows
            });
        }
    });

});

module.exports = router;