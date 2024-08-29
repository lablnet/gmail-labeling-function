


```sh
gcloud functions deploy labelEmail \
  --runtime nodejs20 \
  --trigger-topic email-labeling 
```