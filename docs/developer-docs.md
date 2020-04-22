# Developer Docs

## creating a CLI using node

## command line args

    dependency: command-line-args

## using es6 and import

did not activate import because cli parser would not work

<!-- activating import

    1. dependency: @babel/core @babel/babel-node
    2. when importing use full file name with extension
    3. add to package.json -- "type": "module"

using the command line

    babel-node --no-warnings --experimental-modules -->

## testing

add to package.json

     "jest": {
         // configures jest to use mock fetch
       "automock": false,
       "setupFiles": [
         "./setupJest.js"
       ],

       // avoid CORS errors
       "testEnvironment": "node"
     }
