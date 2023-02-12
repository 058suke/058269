# 058269 by Astro

個人ブログ「[058269](https://058suke.work/) 」をGatsbyからAstroへリプレイス。

## 開発手順

```sh
# Dockerイメージビルド〜コンテナ起動
docker-compose up -d --build

# コンテナ内に入る
docker-compose exec astro /bin/sh

# 開発サーバーを起動する
docker-compose exec astro npx astro dev --host 0.0.0.0
```

## 使用しているツール、ライブラリ、テーマなど

- SSG: [Astro](https://astro.build/)
- theme: [Simple Blog](https://github.com/littlesticks/simple-blog-astro)



### 参考リンク

- [Dockerでnode_modulesをホストとコンテナで同期しないようにする](https://zenn.dev/tamanugi/articles/6f372d45b85c18)
  - node_modulesディレクトリをホストにバインドしないための`docker-compose.yml`記述について。
- [Getting Started 🚀 Astro Documentation](https://docs.astro.build/en/getting-started/)
  - Astroの公式ドキュメント。
- [docker上のアプリにlocalhostでアクセスしたらERR_EMPTY_RESPONSEが出る - Qiita](https://qiita.com/amuyikam/items/01a8c16e3ddbcc734a46)
  - Dockerコンテナ内の開発サーバーにホストのブラウザからアクセスしようとすると`ERR_EMPTY_RESPONSE`が出る時の解消法。
  - `--host 0.0.0.0`オプションをつける。
- [docker-compose の bind mount を1行で書くな](https://zenn.dev/sarisia/articles/0c1db052d09921#%E5%8F%82%E8%80%83)
- [Dockerのマウント3種類についてわかったことをまとめる - Qiita](https://qiita.com/y518gaku/items/456f34c317a65a9dae86)
  - バインドマウント: ホストとコンテナのファイルを共有する。
  - ボリュームマウント: Docker管理のホスト上ファイルシステムに保存する。