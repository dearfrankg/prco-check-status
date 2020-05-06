# @cogent-labs/prco-check-status

A command line utility written for PRCO that will check the status for an inspection request from either WIS or OneGuard servers, then report the results and download related pdf reports.

## Prerequisites

Node is required to use this module. Here is the best way to install Node:

    install xcode if needed

        xcode-select --install

    create .bash_profile if needed

        touch ~/.bash_profile

    Install nvm

        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
        source ~/.bash_profile

    install node

        nvm install 12

## Installation

    npm install -g @cogent-labs/prco-check-status

## Configure

Add your configuration via environment variables to the default location: `$HOME/protected/prco-check-status-env`

    wis_credentials=myusername,mypassword
    wis_test_url=https://test.www.company.com/...
    wis_prod_url=https://www.company.com/...
    wis_report_folder=/path/to/reports

    oneguard_credentials=myusername,mypassword
    oneguard_test_url=https://test.www.company.com/...
    oneguard_prod_url=https://www.company.com/...
    oneguard_report_folder=/path/to/reports

> You can use the `--config_env_file` option to configure another location if you like.

## Usage

`prco-check-status` is a command that can be used on the command line.

        $ prco-check-status

    USAGE:

        prco-check-status [options] requests...

        OPTIONS:

            -c, --config_env_file   location of file containing environment variables
                                    defaults to $HOME/protected/check-status-env
            -h, --help              display usage help
            -e, --environment       environment to use: test or production -- defaults to test
            -s, --server            server to call: wis or oneguard
            -h, --help              show this usage text

        REQUESTS:

            request-id,path-to-download

        EXAMPLES:

            prco-check-status -h

            prco-check-status -e production -s wis 758317/a/b 876321,/q/a

            prco-check-status --environment test --server oneguard 758317/a/b 876321,/q/a

## Details

For every `requestId` on the command line we will query the server to get the report URL and use that to download the report. We will use the `reportFolder` in the `.env` file and the `hierarchyPath` from the command line to construct the `filePath` to save the report.

    filepath = reportFolder + hierarchyPath

            reportFolder: /path/to/gdrive       configured in .env

            hierarchyPath: /a/b/c/758317        entered on the command line

            filePath: /path/to/gdrive/a/b/c/758317/758317.pdf

    we use the filePath to do the following:

        1. confirm containerFolder exists: /path/to/gdrive/a/b/c
        2. create reportFolder: /path/to/gdrive/a/b/c/758317
        3. create reportFile: /path/to/gdrive/a/b/c/758317/758317.pdf

## Author

    Frank Gutierrez    npm.frankg@gmail.com

## License

Copyright (c) 2020 Frank Gutierrez III

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
