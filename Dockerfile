FROM --platform=linux/amd64 node:16.13.0 AS builder
WORKDIR /app
RUN wget https://github.com/DXgovernance/dxvote/archive/refs/heads/master.zip
RUN unzip master.zip
WORKDIR /app/dxvote-master
RUN yarn install --force
RUN yarn build

FROM --platform=linux/amd64 ubuntu:latest
COPY --from=builder /app/dxvote-master/build /build
RUN apt-get update
RUN apt-get -y install wget
RUN wget https://dist.ipfs.io/go-ipfs/v0.12.1/go-ipfs_v0.12.1_linux-amd64.tar.gz
RUN tar -xvzf go-ipfs_v0.12.1_linux-amd64.tar.gz
WORKDIR /go-ipfs
RUN bash install.sh
RUN ipfs --version
RUN ipfs init
RUN ipfs add ../build -r -n
