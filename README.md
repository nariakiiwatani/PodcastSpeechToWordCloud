# Podcast Speech to WordCloud
ポッドキャストなどの音声ファイルからワードクラウドを作成します。エピソードのサムネイルなどの作成にも使えます。

# How to use


---
> 以下は開発者向けドキュメントです

---

# ビルド方法
## 音声認識モデルの配置
https://alphacephei.com/vosk/models
こちらから`Japanese`のモデルをDLして、解凍せずに`public/models/`に配置してください。
```
public/models
└── vosk-model-small-ja-0.22.zip
```

## 辞書ファイルの配置
https://github.com/takuyaa/kuromoji.js/tree/master/dict
こちらから辞書ファイル一式をDLして`public/dict/`に配置してください
```
public/dict
├── base.dat.gz
├── cc.dat.gz
├── check.dat.gz
├── tid.dat.gz
├── tid_map.dat.gz
├── tid_pos.dat.gz
├── unk.dat.gz
├── unk_char.dat.gz
├── unk_compat.dat.gz
├── unk_invoke.dat.gz
├── unk_map.dat.gz
└── unk_pos.dat.gz
```

## ビルド
`package.json`を参照のうえ、`yarn dev`や`yarn build`を実行してください


# ライセンス
This software includes the work that is distributed in the Apache License 2.0.