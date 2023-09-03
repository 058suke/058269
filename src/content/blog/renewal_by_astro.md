---
author: こば！
pubDatetime: 2023-03-06T00:00:00Z
title: GatsbyでつくったブログをAstroでリプレイスしました
postSlug: renewal_by_astro
image: "/images/blog/renewal_by_astro"
featured: true
draft: false
tags:
  - ブログ
  - Gatsby
  - Astro
ogImage: ""
description:
  新しい静的サイトジェネレーターAstroを使ってみたかったのです。
---

ブログ作ったはいいものの、結局最初の投稿から1年半、2件目の投稿をしていませんでした。

決してこのブログの存在を忘れていたわけではなく、ただただ何のアウトプット作業もできていなかっただけです。

## ブログ初投稿時からの環境の変化

ブログ作成時の僕は、サーバーサイドもフロントエンドも扱うWebエンジニアとして会社員をしており、業務で[Serverless Framework](https://www.serverless.com/)に触れる機会があり、AWS LambdaやAmazon API Gatewayで関数やAPIを作成したりしていました。

それまでは名前を知っている程度だった「AWS」とそのサービス群でしたが、その時初めてAWSで構築するサーバーレスなマイクロサービス開発に触れ、クラウド技術とそれらをコード管理するIaCに非常に興味を持ったのです。

そこで、Webアプリケーション開発を主とする部署から、クラウド開発やDevOps開発を主とする部署へ社内公募制度を利用して異動しました。

## このブログに使った技術の振り返り

当時僕が習得したかった技術を詰め込んで作成されています。

- 静的サイトジェネレーター
- AWS（クラウド）
- CI/CDパイプラインの構築
- IaC(Infrastructure as Code)
- その他

### 静的サイトジェネレーター　Astro

開設当時は[Gatsby](https://www.gatsbyjs.com/)を使っていましたが、ReactとGraphQLを用いているため個人的に学習コストが高く、立ち上げにも苦労しました。
開設から時が過ぎ、静的サイトジェネレーターで何やら「Astroというのが出てきたらしい」という情報を嗅ぎつけ、使ってみたい欲が湧きました。

[公式ドキュメント](https://docs.astro.build/en/getting-started/)も充実しており、一通りチュートリアルを実施し、Gatsbyよりも学習コスト低めで、ブログのような発信メインなWebページを手軽に作成できることがわかり、当ブログをGatsbyからAstroにリプレイスすることに。

個人的にAstroの以下の部分が気に入ってます。

- ReactやVueなどのフレームワークを統合できる。
- `.astro`ファイルはJSXっぽくUIを記述するけど、よりHTMLに近い書き方ができる。
- UIをコンポーネント化して開発できる。

### AWS

このブログは、AstroをビルドしてできたHTML/CSSファイル等をAmazon S3にアップロードし、Amazon CloudFrontでキャッシュしています。
また、独自ドメイン（`058suke.work`）を取得しているのでAmazon Route 53にDNSレコード登録し、さらにAWS Certificate Manager(ACM)でSSL証明書を発行しています。

### Terraform

上記のAWSリソースをTerraformでコード管理・バージョン管理を行なっています。
Infrastructure as Codeとして、インフラがどういう構成、状態になっているのが理想なのかをコード化しておけるので、AWSマネジメントコンソールを開かずとも、コードを読めばAWSリソースの状態や存在がわかるのがメリット。
さらに、コード化することでGit管理ができるため、つまりインフラの状態をバージョン管理できるのは本当に画期的です。

### GitHubとGitHub Actions

このブログで使用しているAstro（アプリケーション）とTerraform（インフラ）は、それぞれGitHub上の別リポジトリで管理されています。
また、Astroのリポジトリに関してはGitHub Actionsを用いて静的解析とビルド・デプロイを行なっています。
(Terraformのリポジトリも、同様に行いたいけどまだできてない)
また、完全に僕個人で開発していますが、GitHubでIssueを立てて、Pull Request作成・マージを行なってます。

ブログ立ち上げで使用した技術や得た知見は、今後しっかりアウトプットしていきます！

ご覧いただきありがとうございました！
