# GitHub Action for Bunny CDN certificate deployment

Deploy SSL certificate to Bunny CDN.

## Usage

This action will deploy your PEM-formatted SSL certificate to Bunny CDN.

```yaml
jobs:
  deploy-to-bunny-cdn:
    name: Deploy certificate to Bunny CDN
    runs-on: ubuntu-latest
    steps:
      - name: Check out
        uses: actions/checkout@v2
        with:
          # If you just commited and pushed your newly issued certificate to this repo in a previous job,
          # use `ref` to make sure checking out the newest commit in this job
          ref: ${{ github.ref }}
      - uses: imlonghao/deploy-certificate-to-bunnycdn@v1
        with:
          # The ID of the requested Pull Zone
          id: ${{ env.BUNNY_ID }}
          # The hostname to which the hostname will be added
          hostname: ${{ env.BUNNY_HOSTNAME }}
          # The API access key from https://dash.bunny.net/account/settings
          access-key: ${{ secrets.BUNNY_ACCESS_KEY }}

          # Specify PEM fullchain file
          fullchain-file: ${{ env.FILE_FULLCHAIN }}
          # Specify PEM private key file
          key-file: ${{ env.FILE_KEY }}
```
