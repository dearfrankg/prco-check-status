# Developer Docs

## using babel and esm

    Don't really need it

## install script to be used on the system

    Add section to package.json

        "bin": {
            "prcoText": "./src/prco-text.js"
        }

## processing CLI options

    Add dependency

        minimist

## testing

    Mocking the fetch command

        add dependency:

            jest-fetch-mock

        add setupJest.js file

            //setupJest.js or similar file
            require("jest-fetch-mock").enableMocks();

        configure package.json

            "jest": {
                "automock": false,
                "setupFiles": [
                    "./setupJest.js"
                ]
            }

    Avoid CORS errors while testing

        "jest": {
            ...
            "testEnvironment": "node"
        }

## publishing to npm

    Configure package.json

        "publishConfig": {
            "registry": "https://registry.npmjs.org/",
            "access": "public"
        },
