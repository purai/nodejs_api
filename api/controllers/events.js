const Event = require('../models/Event');
const uuidv1 = require('uuid/v1');
const helpers = require('../helpers/PurAiHelpers');
const validate = require('uuid-validate');
const nested = require('../helpers/ConvertToNestedHelper');

exports.get_events = (req, res) => {
    if (req.query.uuid !== undefined && !validate(req.query.uuid)) {
        res.status(500).json({
            message: 'Events cannot be returned. Check details message for more info',
            details: 'UUID format is invalid'
        });
        return;
    }

    Event.getEvents(req.query.saleplace, req.query.category, req.query.upcoming, req.query.status, req.query.uuid, req.query.search, req.query.page, req.query.limit, (err, rows) => {
        if (err) {
            res.status(500).json({
                message: 'Events cannot be returned. Check details message for more info',
                details: err.sqlMessage
            });
        } else {
            const nestingOptions = [{
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

            const nestedRows = nested.convertToNested(rows, nestingOptions);
            res.status(200).json({
                events: nestedRows
            });
        }
    });
};

exports.create_event = (req, res) => {
    const newUuid = uuidv1();
    const placePhoneNumberFormatted = helpers.formatPhoneNumber(req.body.place_phone);

    Event.postEvent(req.body, newUuid, placePhoneNumberFormatted, (err) => {
        if (err) {
            res.status(500).json({
                message: 'Event cannot be register. Check details message for more info',
                details: err.sqlMessage
            });
        } else {
            res.status(200).json({
                message: 'Event successfully registered',
                uuid: `${newUuid}`
            });
        }
    });
};

exports.delete_event = (req, res) => {
    if (req.params.uuid !== undefined && !validate(req.params.uuid)) {
        return res.status(500).json({
            message: 'Events cannot be deleted. Check details message for more info',
            details: 'UUID format is invalid'
        });
    }

    Event.deleteEvent(req.params.uuid, (err, count) => {
        if (err) {
            res.status(500).json({
                message: 'Event cannot be remove. Check details message for more info',
                details: err
            });
        } else if (count.affectedRows === 0) {
            res.status(500).json({
                message: 'Event cannot be remove. Check details message for more info',
                details: `Event ${req.params.uuid} not found`
            });
        } else {
            res.status(200).json({
                message: 'Event successfully removed',
                details: `Affected rows ${count.affectedRows}`
            });
        }
    });
};

exports.update_event = (req, res) => {
    if (req.params.uuid !== undefined && !validate(req.params.uuid)) {
        res.status(500).json({
            message: 'Events cannot be updated. Check details message for more info',
            details: 'UUID format is invalid'
        });
        return;
    }

    const placePhoneNumberFormatted = helpers.formatPhoneNumber(req.body.place_phone);

    Event.putEvent(req.params.uuid, placePhoneNumberFormatted, req.body, (err, rows) => {
        if (err) {
            res.status(500).json({
                message: 'Event cannot be updated. Check details message for more info',
                details: err.sqlMessage
            });
        } else {
            res.status(200).json({
                message: 'Event successfully updated',
                details: rows
            });
        }
    });
};