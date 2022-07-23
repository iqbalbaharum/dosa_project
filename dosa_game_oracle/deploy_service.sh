#! /bin/bash

npx aqua run --input ./aqua/game_oracle.aqua --func 'user_data("44e2c53b1a898ccb3a43ea975bb4c9f2656676fc612fb0b408f1d6ce7f394f12")' --addr /dns4/kras-00.fluence.dev/tcp/19990/wss/p2p/12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e

# aqua remote deploy_service \
#     --addr /dns4/kras-00.fluence.dev/tcp/19990/wss/p2p/12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e \
#     --sk ears2TjmaLHmiDyoQEKbLq+IOITwRh6qFwaECPoF6d4= \
#     --config-path configs/hello_world_deployment_cfg.json \
#     --service dosagameservice