# complex-filter-stream

Filter out objects that don't match a series of filtering requirements.

##TL;DR



## How to build the filter.

`complex-filter-stream` is a `Transform` stream that takes a series of filtering requirements. They are passed to the stream as a json object.

### A simple filter

```json
[
	{
		"type": "simple",
		"searchFor": "search string",
		"searchOn": "microscopist",
		"searchType": "contains"
	}
]
```

Notice that the `filter object` is part of an array. That is because `complex-filter-stream` let you stack filters. Now let's go through the specifics.

#### `type`

The `type` field can accept four values: `simple`, `AND`, `OR` and `NOT`. We will talk extensively about it soon enough.

#### `searchFor`

The `searchFor` field takes what should be expected to see in the object for filter in.

#### `searchOn`

The `searchOn` field takes the fields of the object that will be filtered.

#### `searchType`

The `searchType` field is used to identify the type of filter it should be used. Currently, `complex-filter-stream` supports:

`contains`: passes if the value of `searchFor` matches anywhere in the `object[searchOn]`.  
`exact`: passes if the value of `searchFor` matches exactly the `object[searchOn]`.  
`startsWith`: passes if the value of `searchFor` matches the beginning of the `object[searchOn]`.  
`endsWith`: passes if the value of `searchFor` matches the end of the `object[searchOn]`.

### A complex filter.

Let's suppose that our objects to be filtered looks like this:

```json
{
	"date": 1161302400,
	"NBCItaxID": 80880,
	"speciesName": "Hylemonella gracilis",
	"tiltSingleDual": 1,
	"defocus": -12,
	"dosage": 75,
	"tiltConstant": 1,
	"tiltMin": -63,
	"tiltMax": 60,
	"tiltStep": 0.9,
	"microscopist": "Gavin Murphy",
	"institution": "Caltech",
	"lab": "Jensen Lab",
	"sid": "gm2006-10-20-4"
}
```

and we would like to filter in all objects with `NCBItaxID` as `80880` **AND** `microscopist` as `Gavin Murphy`.

To do that we need two filter requirements, let's see how to organize them:

```json
[
	{
		"type": "AND",
		"searchFor": 80880,
		"searchOn": "NCBItaxID",
		"searchType": "exact",
		"next": {
			"type": "simple",
			"searchFor": "Gavin Murphy",
			"searchOn": "microscopist",
			"searchType": "exact"
		}
	}
]
```

so... `complex-filter-stream` will look for the `next` field in the search box if the `type` of filter is `AND` or `OR`. In contrast, `simple` and `NOT` does not read `next` filter requirement and if any exists will be ignored.

Let's build a filter for objects with `NCBItaxID` as `80880` **AND** `microscopist` as `Gavin Murphy` **OR** `Matt Swulius`:

```json
[
	{
		"type": "AND",
		"searchFor": 80880,
		"searchOn": "NCBItaxID",
		"searchType": "exact",
		"next": {
			"type": "OR",
			"searchFor": "Gavin Murphy",
			"searchOn": "microscopist",
			"searchType": "exact",
			"next": {
				"type": "simple",
				"searchFor": "Matt Suwlius",
				"searchOn": "microscopist",
				"searchType": "exact",
			}
		}
	}
]
```




