# GitHub Action for GoEdge CDN certificate deployment

Deploy SSL certificate to GoEdge CDN.

## Usage

This action will deploy your PEM-formatted SSL certificate to GoEdge CDN.

```yaml
jobs:
  deploy-to-goedge-cdn:
    name: Deploy certificate to GoEdge CDN
    runs-on: ubuntu-latest
    steps:
      - name: Check out
        uses: actions/checkout@v2
        with:
          # If you just commited and pushed your newly issued certificate to this repo in a previous job,
          # use `ref` to make sure checking out the newest commit in this job
          ref: ${{ github.ref }}
      - uses: renbaoshuo/deploy-certificate-to-goedge@beta-v1
        with:
          # GoEdge API endpoint
          api-endpoint: https://cdn.api.baoshuo.dev

          # Use Access Key
          access-key-type: user
          access-key-id: ${{ secrets.GOEDGE_ACCESS_KEY_ID }}
          access-key: ${{ secrets.GOEDGE_ACCESS_KEY }}

          # GoEdge certificate ID
          cert-id: ${{ secrets.GOEDGE_CERT_ID }}

          # Specify PEM fullchain file
          fullchain-file: ${{ env.FILE_FULLCHAIN }}
          # Specify PEM private key file
          key-file: ${{ env.FILE_KEY }}
```
