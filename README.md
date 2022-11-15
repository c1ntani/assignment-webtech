# Web Technologies Assignment ( Node Js, SQLite )

## Requirements

For the project, you will only need Node.js and a node global package, NPM, installed in your environement.

## Install

Clone the Github Repository and cd to the project folder. Then run the below command to install all the required dependencies of the assignment.

    $ git clone {GITHUB_REPO_LINK}
    $ cd {PROJECT}
    $ npm install

## Dependencies Used

1. **express** - Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
2. **sqlite3** - Sqlite3 npm package is an asynchronous, non-blocking SQLite3 bindings for Node.js.
3. **cors** - CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
4. **moment** - MomentJS is a JavaScript library which helps is parsing, validating, manipulating and displaying date/time in JavaScript in a very easy way

## Running the project

    $ npm run start

## API Documentation

### POST /item

This api is used to add new item into the system. This item stays in memory until card is provided
Request body :

```
{
    "name": string,
    "category": string,
    "price": number
}
```

### POST /card

This api is used to add card number and store information into the system.
Request body :

```
{
    "card_number": number,
    "store_name": string,
    "location": string,
    "date": DD.MM.YY
}
```

### GET /card/:card_number

This api is used to get all items registered to the card number
Request URL Params :

```
    "card_number": number,
```

### GET /store/:store_name

This api is used to get all items registered to the store
Request URL Params :

```
    "store_name": string,
```

### GET /location/:location

This api is used to get all items registered to the location
Request URL Params :

```
    "location": string,
```

### GET /day/:date

This api is used to get all items registered on the given date
Request URL Params :

```
    "date": DD.MM.YY,
```

### GET /month/:month_number/:year_number

This api is used to get all items registered on the given month-year combination
Request URL Params :

```
    "month_number": number,
    "year_number": number
```
