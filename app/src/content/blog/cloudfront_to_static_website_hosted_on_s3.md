---
author: こば！
pubDatetime: 2023-04-21T16:30:00Z
title: Amazon S3とCloudFrontで静的サイトをホスティングしたい！
postSlug: cloudfront_to_static_website_hosted_on_s3
image: "/images/blog/cloudfront_to_static_website_hosted_on_s3/eyecatch_cloudfront_to_static_website_hosted_on_s3"
featured: true
draft: false
tags:
  - AWS
  - S3
  - CloudFront
ogImage: ""
description:
  静的WebサイトをAmazon S3とCloudFrontでホスティングとCDN配信してみます。
---

このブログは、静的サイトジェネレーターの[Astro](https://astro.build/)をビルドすると出来上がる静的ファイルをS3にアップロード・ホストし、CloudFrontでキャッシュしつつ、ページの高速化を行なっています。

そこで、この記事では、実際にローカルで作成したHTMLファイルを、S3バケットにアップロードし、CloudFrontでキャッシュされるように設定していきたいと思います。

## 目次

## イメージ

<div align="center">
  <img src="/images/blog/cloudfront_to_static_website_hosted_on_s3/diagram.png" alt="構成図">
</div>

実際この構成だけで、Webページを公開することはほぼないと思います。  
HTTPでアクセスされるとHTTPSにリダイレクト（常時SSL化）したり、独自ドメインを割り当ててWebページを公開すると思います。
それらに関しては、また別記事でまとめます。

## 手順

1. 静的ページのソースファイルを用意する。
2. S3にバケットを作成し、ソースファイルをアップロードする。
3. CloudFrontディストリビューションを作成し、オリジンをS3バケットに指定する。
4. S3バケットポリシーを更新する。

## 1. 静的ページのソースファイルを用意する

```
# ファイル構成
.
├── index.html
├── css　
│   └── style.css
└── image
    └── sample.png
```

上記のようなディレクトリ構成で、ページを公開するとします。

## 2. S3にバケットを作成し、ソースファイルをアップロードする

- AWSマネジメントコンソールにログインし、S3のコンソールを開きます。
  - AWSマネジメントコンソールログイン後、ページ上部の検索窓から「S3」と検索すれば出てきます。
- 「バケットを作成」ボタンを押し、バケット作成画面へ遷移します。

### 2-1. バケットを作成する
  
<div align="center">
  <img src="/images/blog/cloudfront_to_static_website_hosted_on_s3/create_s3_bucket_general_setting.png" alt="AWS S3コンソール > バケットを作成 > 一般的な設定">
</div>

- `バケット名`
  - 好きな名前を入力します。
  - ただし、バケット名は**グローバルでユニーク**である必要があります。「**グローバルでユニーク**」つまり、世界中の誰も使っていないS3バケット名である必要があります！
- `AWSリージョン`
  - 好きなリージョンを選択します。と言ってもレイテンシーを少なくするため、基本はそのバケット内のオブジェクトを取得しようとするユーザーやアプリケーションなどの最寄りリージョンを選択するのが一般的です。

#### ⚠️注意点

ちなみに、ここで入力・選択したバケット名やリージョンは後から変更することはできません。  
もし変更したくなった場合は、バケットを再作成する必要があることに注意してください！

!["AWS S3コンソール > バケットを作成 > オブジェクト所有者"](/images/blog/cloudfront_to_static_website_hosted_on_s3/create_s3_bucket_object_owner_block_public_access.png)

- `オブジェクト所有者`
  - 今回は「**ACL無効（推奨）**」を選びます。
    - ACL(アクセスコントロールリスト)は、他のAWSアカウントやユーザーなどのバケットやオブジェクトに対するアクセス権限を管理できます。
    - 今回は、自身のアカウントにてバケットへオブジェクトを`put`、CloudFrontから`get`し、外部からのアクセスや他AWSアカウントからのアクセスは行わないため「**ACL無効(推奨)**」を選択します。
- `このバケットのブロックパブリックアクセス設定`
  - 今回は「**パブリックアクセスを*すべて*ブロック**」のみチェックを入れます。
  - この項目は、バケットを公開して誰でもアクセス可にするかどうかを設定します。

!["AWS S3コンソール > バケットを作成 > バケットのバージョニング"](/images/blog/cloudfront_to_static_website_hosted_on_s3/create_s3_bucket_bucket_versioning_tags.png)

- `バケットのバージョニング`
  - どちらを選択してもOKです。
  - しかし、今回作成するS3バケットにアップロードする静的ファイルをGit管理しているのであれば「**無効にする**」で良いかと思います！
  - バージョニングを有効にすれば誤ってファイルを削除したり、任意のタイミングのファイル状態に戻したりなどが可能となります。
    - ただし、バージョニングを有効にすれば過去バージョンもS3バケットに保存されたままとなるのでストレージ料金がかかります。
- `タグ`
  - タグの追加は任意です！
  - タグはAWSリソースを管理する上で有用なので、同じAWSアカウント上に複数サービスやWebページを公開する予定であれば識別できるようなタグをつけておくことをオススメします！

!["AWS S3コンソール > バケットを作成 > デフォルトの暗号化"](/images/blog/cloudfront_to_static_website_hosted_on_s3/create_s3_bucket_default_encrypt.png)

- `暗号化キータイプ`
  - 基本的には**SSE-S3**で問題ありません。
  - ここでいう「暗号化」は、このS3バケットにアップロードしたオブジェクトをサーバーサイドで暗号化してくれる機能です。
  - キータイプは、暗号化する際のキーの作成や管理方法を2種類から選ぶことができます。
    - [SSE-S3](https://docs.aws.amazon.com/ja_jp/AmazonS3/latest/userguide/UsingServerSideEncryption.html)
      - S3マネージドキーであり、キーの作成・管理をS3が行なってくれます。
      - 追加費用はありません。
    - [SSE-KMS](https://docs.aws.amazon.com/ja_jp/AmazonS3/latest/userguide/UsingKMSEncryption.html)
      - AWS KMS(Key Management Service)というAWSのキー管理サービスを利用して、キーの作成・管理を行います。
      - KMSの利用料金が発生します。
      - KMSではキーのローテーションが可能であり、またキーの利用状況を監視などが可能なため、よりセキュアに暗号化を行いたい場合はSSE-KMSの利用をおすすめします（例えば、個人情報などをS3バケットに保管する時など）

最後に「バケットを作成」ボタンを押し、下記のようなフラッシュメッセージが表示されるとバケット作成は完了です！

!["AWS S3コンソール > バケットが正常に作成されました"](/images/blog/cloudfront_to_static_website_hosted_on_s3/create_s3_bucket_created_flash.png)

### 2-2. バケットに静的ファイルをアップロードする

1.で用意した静的ファイルをディレクトリごと、作成したバケットにアップロードします。

ちなみに、この時点ではまだWebページは公開されていません。
S3だけでページを公開したい場合は、バケットのプロパティから静的ホスティングを有効化する必要があります。

## 3. CloudFrontディストリビューションを作成し、オリジンをS3バケットに指定する

- AWSマネジメントコンソールにログインし、CloudFrontのコンソールを開きます。
  - AWSマネジメントコンソールログイン後、ページ上部の検索窓から「CloudFront」と検索すれば出てきます。
- 「ディストリビューション作成」ボタンを押し、ディストリビューション作成画面へ遷移します。

### 3-1. ディストリビューションを作成する

!["AWS CloudFrontコンソール > オリジン"](/images/blog/cloudfront_to_static_website_hosted_on_s3/create_distribution_origin.png)

- `オリジンドメイン`
  - **2-1.で作成したS3バケット**を選択します。
    - CloudFrontで指定できるオリジンは、S3バケット以外にALB(Application Load Balancer)、EC2インスタンス、Lambda関数などのAWSリソースとAWS外で構築したWebサーバーも指定できます。
- `オリジンパス`
  - エンドユーザーがリクエストしたURLから、オリジンに対してコンテンツをリクエストする時に追加するパスを指定します。
    - 例えば、オリジンをS3バケットに指定し、オリジンパスを`/production`と指定した場合、エンドユーザーが`example.com/index.html`というURLでリクエストしてきた場合は、オリジンであるS3バケットに対し`/production/index.html`というオブジェクトを取得しにいきます。
    - 参考リンク：[ディストリビューションを作成または更新する場合に指定する値 - Amazon CloudFront](https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesOriginPath)
  - 今回の場合は、空欄で問題ありません。
- `名前`
  - `オリジンドメイン`を選択した時点で、自動的に入力された値から変更しなくてOKです。
- `S3バケットアクセス`
  - オリジンであるS3バケットへのアクセスをCloudFrontからのリクエストのみに制限することができます。
  - 基本的には、推奨である**Origin access control settings**(OAC)を選択します。
    - `Public`はバケットをブロックパブリックアクセスを無効化（パブリックアクセスできる状態に）する必要があります。
    - `Legacy access identiies`はOACが導入される以前のアクセス制限の方法ですが、S3バケット暗号化のSSE-KMSに非対応であったり2022年12月以降に設置されたリージョンに属するバケットに非対応であったりと、機能的に制限があります。
  - `Origin access control`を選択すると、コントロール設定を既存のものを選択 もしくは 新しく作成する必要があります。
  - 新しく作成する場合は「コントロール設定を作成」ボタンを押して、設定を作成します。
    - OACを選択した場合は、ディストリビューション作成後に表示されるポリシーを、S3バケットに適用する必要があるのをお忘れなく！
- `カスタムヘッダーを追加 - オプション`
  - 特別に必要なヘッダーがあればこちらで指定します。
- `オリジンシールドを有効にする`
  - 今回は**いいえ**を選択します。
- `追加設定`
  - デフォルトのままで設定します。

!["AWS CloudFrontコンソール > デフォルトのキャッシュビヘイビア"](/images/blog/cloudfront_to_static_website_hosted_on_s3/create_distribution_default_cache_behavior.png)

- `パスパターン`
  - CloudFrontにキャッシュさせるオリジンのパスを指定します。
  - 今回は**デフォルト (*)** のままにしておきます。
    - （というか、新しいディストリビューションを作成する際は、デフォルトから変更はできません！）
    - デフォルト(*)のままにすると、オリジンの全てのファイルやオブジェクトなどをキャッシュしてくれます。
    - 例えば一部キャッシュさせたくないものがあれば、そのファイルやオブジェクトを含ませないようにパスを指定する必要があります。
- `オブジェクトを自動的に圧縮`
  - **Yes**で問題ありません。
  - HTMLやCSS、JavaScriptファイルなどを圧縮してくれるため、ユーザーからのページアクセスに対し、ページ表示に必要なファイルの読み込みが速くなりページの表示速度が速くなります。
- `ビューワープロトコルポリシー`
  - まずは、**HTTP and HTTPS**にしておきます。
    - 別記事にて、今回作成したCloudFrontをSSL化する方法をご紹介します！
    - 今回はひとまずS3+CloudFrontでホスティングできることを確認したいため一旦**HTTP**でアクセスできるようにしておきます。
- `許可されたHTTPメソッド`
  - **GET, HEAD**にしておきます。
  - 用途によって許可するメソッドを変更してください。
- `ビューワーのアクセスを制限する`
  - **No**にしておきます。
    - 今回は、アクセス制限などを設けず一般公開するWebページをホスティングしたいため。
- `キャッシュキーとオリジンリクエスト`
  - **Cache policy and origin request policy (recommended)** にしておきます。
  - キャッシュキー
    - CloudFrontへのコンテンツ配信のリクエストに対し、そのリクエストするものがCloudFrontでキャッシュされているか/いないかを「CloudFrontのディストリビューションドメイン」や「オブジェクトのパス」をもとに判定します（デフォルト）。この判定する条件に別の条件を付け加えたい時にカスタムします。
    - 例: クライアントの言語情報やアクセス時間帯や国・都市、クエリパラメーター、Cookieなど。
  - オリジンリクエスト
    - CloudFrontからオリジンサーバーへオブジェクトを取得しにいく際は、CloudFrontへのリクエスト時にユーザーから送られてきたヘッダー、クエリパラメーター、Cookieは送られない（デフォルト）。オリジンへのアクセス時に、これらの情報を含めたい場合はカスタムします。
  - 参考リンク：[CloudFront の Cache Policy と Origin Request Policy を理解する - Qiita](https://qiita.com/t-kigi/items/6d7cfccdb629690b8d29)

!["AWS CloudFrontコンソール > 関数の関連付け"](/images/blog/cloudfront_to_static_website_hosted_on_s3/create_distribution_allocated_function.png)

- ユーザーからのリクエスト時、そしてリクエストに対するレスポンス時に任意の処理を実行することができます。
- Lambda@EdgeやCloudFront Functionを指定することができます。
- 今回は、すべて**関連付けなし** にしておきます。
  - 別記事にて、wwwなし(あり)でアクセスした時に、URLにwwwをつける(外す)処理や、URLの末尾が「/」である場合にドキュメントルートを指定する方法をご紹介します！

!["AWS CloudFrontコンソール > 設定"](/images/blog/cloudfront_to_static_website_hosted_on_s3/create_distribution_settings.png)

- `料金クラス`
  - **すべてのエッジロケーションを使用する (最高のパフォーマンス)** にしておきます。
- `AWS WAF ウェブ ACL`
  - 今回は特に指定しません。
  - AWS WAFを用いてクロスサイトスクリプティングやSQLインジェクションからWebアプリケーションを防御したい時に有効にします。
- `代替ドメイン名(CNAME)`
  - 今回は、指定しません。
  - 別記事にて、CloudFrontに独自ドメインを適用する方法をご紹介します！
- `カスタムSSL証明書`
  - 今回は、指定しません。
  - 別記事にて、CloudFrontをSSL化する方法をご紹介します！
- `サポートされているHTTPバージョン`
  - **HTTP/2** にチェックを入れます。
    - **HTTP/3** はチェックを入れても入れなくてもどちらも良いです。
- `デフォルトルートオブジェクト`
  - 今回は、**index.html**を指定します。
  - CloudFrontの**ルートURL**にファイルを指定せずにアクセスされた場合に返すオブジェクトを指定できます。
  - 注意点は、あくまで**ルートURL**であり、サブディレクトリには適用されません。
    - 例: デフォルトルートオブジェクトに`index.html`を指定した場合
      - `https://aiueo.cloudfront.net/`（CloudFrontのルートURL）にアクセスすると`https://aiueo.cloudfront.net/index.html`を返してくれます。
      - `https://aiueo.cloudfront.net/sub/`（サブディレクトリURL）にアクセスしても`https://aiueo.cloudfront.net/sub/index.html`を返してくれません（実際にオブジェクトがあったとしても！）
  - サブディレクトリでもルートオブジェクトを指定するためには、前述の「関数の関連付け」にて、URLに自動でルートオブジェクトを付与する処理を行う関数を紐づけなければいけません！（別記事でご紹介します）
- `標準ログ記録`
  - 今回は、**オフ**にしておきます。
    - オンにするとアクセスログをS3に出力してくれます。ログ出力する機能自体は無料で利用可能ですが、ログを保存するS3のストレージ料金や転送料は発生します。
- `IPv6`
  - **オン**にしておきます。
  
最後に「ディストリビューションを作成」ボタンを押し、下記のようなフラッシュメッセージが表示されるとバケット作成は完了です！

!["AWS CloudFrontコンソール > 新しいディストリビューションが正常に作成されました。"](/images/blog/cloudfront_to_static_website_hosted_on_s3/create_distribution_created_flash.png)

### 3-2. ディストリビューションのドメインにアクセスしてみる

ちなみに、この時点でディストリビューションのドメインにアクセスすると`Accesss Denied`の画面が表示されます。  
これは、オリジンのS3バケットがCloudFrontディストリビューションからのアクセスを拒否しているためです。  

CloudFrontディストリビューションの作成が完了したことをお知らせするフラッシュメッセージが表示されたかと思いますが、  
そのフラッシュメッセージの下に「S3バケットポリシーを更新する必要があります」という別のアラートが出ているかと思います。  

ということで、最後に今回作成したCloudFrontディストリビューションからオリジンのS3バケットにオブジェクトを取得できるように、S3バケットのポリシーを更新したいと思います。

## 4. S3バケットポリシーを更新する

!["AWS CloudFrontコンソール > S3バケットポリシーを更新する必要があります。"](/images/blog/cloudfront_to_static_website_hosted_on_s3/create_distribution_update_s3_bucket_policy.png)

「ポリシーをコピー」ボタンを押下すると、ポリシーの中身をクリップボードにコピーしてくれます。  

コピーしたら「S3バケットの権限に移動してポリシーを更新する」のリンクを押下し、オリジンであるS3バケットのコンソール画面に遷移します。

### 4-1. バケットポリシーを編集して保存する

!["AWS CloudFrontコンソール > バケットポリシー"](/images/blog/cloudfront_to_static_website_hosted_on_s3/update_s3_bucket_policy_bucket_policy.png)

- 「編集」ボタンを押し、バケットポリシーの編集画面に遷移します。

!["AWS CloudFrontコンソール > バケットポリシーを編集"](/images/blog/cloudfront_to_static_website_hosted_on_s3/update_s3_bucket_policy_edit_policy.png)

- エディタ部分に、先程コピーしたポリシーステートメントを貼り付けます。
  - 貼り付けるポリシーステートメントは多分以下のようなJSONだと思います。
- 最後に「変更の保存」ボタンを押下して、作業は終わりです。

```json
{
  "Version": "2008-10-17",
  "Id": "PolicyForCloudFrontPrivateContent",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${S3バケット名}/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::${AWSアカウント}:distribution/${CloudFrontディストリビューションID}"
        }
      }
    }
  ]
}
```

### 4-2. もう一度、ディストリビューションのドメインにアクセスしてみる

今度は、ちゃんと`index.html`のページが表示されます！  
もし表示されない場合は、数秒〜数分ほど経ってから再度アクセスしてみてください！

## おわり

以上、S3+CloudFrontで静的サイトをホスティングする方法をご紹介しました！  
ただ、これだけではあまり実用的ではありません。  
次回は、HTTPSのみアクセスできるようにしたり(SSL化)、独自ドメインでアクセスする方法をご紹介したいと思います。  

ご指摘あればTwitterからお願いします！
