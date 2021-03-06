var deepEqual = require('deep-equal');
var convert = require('./lib/convert');

module.exports = openapiSchemaToJsonSchema;

function openapiSchemaToJsonSchema(schema, options) {
	var notSupported = [
		'nullable', 'discriminator', 'readOnly',
		'writeOnly', 'xml', 'externalDocs',
		'example', 'deprecated'
	];

	options = options || {};
	options.dateToDateTime = options.dateToDateTime || false;
	options.cloneSchema = options.cloneSchema == false ? false : true;
	options.supportPatternProperties = options.supportPatternProperties || false;
	options.keepNotSupported = options.keepNotSupported || [];

	if (typeof options.patternPropertiesHandler !== 'function') {
		options.patternPropertiesHandler = patternPropertiesHandler;
	}

	options._removeProps = [];

	if (options.removeReadOnly === true) {
		options._removeProps.push('readOnly');
	}

	if (options.removeWriteOnly === true) {
		options._removeProps.push('writeOnly');
	}

	options._structs = ['allOf', 'anyOf', 'oneOf', 'not', 'items', 'additionalProperties'];
	options._notSupported = resolveNotSupported(notSupported, options.keepNotSupported);

	if (options.cloneSchema) {
		schema = JSON.parse(JSON.stringify(schema));
	}

	schema = convert.schema(schema, options);
	schema['$schema'] = 'http://json-schema.org/draft-04/schema#';

	return schema;
}

function patternPropertiesHandler(schema) {
	var pattern
		, patternsObj = schema.patternProperties
		, additProps = schema.additionalProperties
	;

	if (typeof additProps !== 'object') {
		return schema;
	}

	for (pattern in patternsObj) {
		if (deepEqual(patternsObj[pattern], additProps)) {
			schema.additionalProperties = false;
			break;
		}
	}

	return schema;
}

function resolveNotSupported(notSupported, toRetain) {
	var i = 0
		, index
	;

	for (i; i < toRetain.length; i++) {
		index = notSupported.indexOf(toRetain[i]);

		if (index >= 0) {
			notSupported.splice(index, 1);
		}
	}

	return notSupported;
}

