# ipfs-friends

[![Build Status](https://travis-ci.org/tableflip/ipfs-friends.svg?branch=master)](https://travis-ci.org/tableflip/ipfs-friends) [![dependencies Status](https://david-dm.org/tableflip/ipfs-friends/status.svg)](https://david-dm.org/tableflip/ipfs-friends) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> get by with a little help from your friends (to share files)

Turn IPFS peers in to file sharing friends.

## Install

```sh
npm install -g ipfs-friends
```

## Usage

### CLI

1. Install IPFS (JS or Go flavour).
2. Start your daemon (with pubsub enabled):
    ```sh
    (js)ipfs dameon --enable-pubsub-experiment
    ```
3. Start friends:
    ```sh
    friends
    ```

```console
# It all starts with friends
$ friends
> Welcome friend...
> ls
Alan             QmHashHashHashHashHashHash
Alex             QmHashHashHashHashHashHash
SupriousLongName QmHashHashHashHashHashHash

# Add a peerId as a friend you want to co-host
> add QmHashHashHashHashHashHash Jamie
👍😙👍

# Stop following a friend
> dump Jamie
💦🗑

Alan is here ✨🎷🐩

# Tell your friends about something you want to share
> share bafyba6hdhnxndKDFJLDKJF best-cat-gif
https://share.ipfs.io/#/bafyba6hdhnxndKDFJLDKJF

Alan got best-cat-gif
Alex got best-cat-gif
Alan went away 👋
Alex shared best-cat-gif bafyba6hdhnxndKDFJLDKJF
```
