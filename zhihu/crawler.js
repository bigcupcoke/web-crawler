const fs = require('fs')

// 引入 这两个包， 方便解析字符串的
const cheerio = require('cheerio')
const request = require('sync-request')

// 引入 工具 utlis 里面的函数
const { log } = require('../utlis')

class Crawler {
    constructor(url) {
        this.url = url
        this.init()
        this.save()
    }

    init() {
        this.rawInfo = {
            name: '',
            score: 0,
            quote: '',
            ranking: 0,
            coverUrl: '',
        }
    }

    // 拿到 body 部分
    bodyFromUrl() {
        const res = request('GET', this.url)
        const body = res.getBody('utf8')
        return body
    }

    updateInfo(div) {

    }


    infoFromDiv(div) {
        let e = cheerio.load(div)
        let info = Object.assign({}, this.rawInfo)
        info.name = e('.title').text()
        info.quote = e('inq').text()
        info.score = e('rating_num').text()
        info.ranking = e('.pic').find('em').text()
        info.coverUrl = e('.pic').find('img').attr('src')
        return info
    }

    // 从每个 div 容器中 拿到 movie 的信息
    infoFormBody() {
        let body = this.bodyFromUrl()
        // cherrio.load 会把 html字符串解析成 dom
        const e = cheerio.load(body)
        const movieDivs = e('.item')
        const movies = Array.from(movieDivs).map((d) => {
            let div = e(d).html()
            return this.infoFromDiv(div)
        }, this)
        return movies
    }

    path() {
        let name = this.constructor.name.toLowerCase()
        let p =  __dirname + `/${name}.txt`
        log('path', p)
        return p
    }

    save() {
        let info = this.infoFormBody()
        let s = JSON.stringify(info, null, 2)
        let path = this.path()
        fs.writeFileSync(path, s)
    }
}

const __main = () => {
    const url = 'https://movie.douban.com/top250?start=100'
    new Crawler(url)
}

__main()
