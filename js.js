const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'TRAM';

const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Tay to",
            singer: "MCK, RPT PhongKhin",
            path: "./music/tayto.mp3",
            image: "./images/tayto.jpg"
        },
        {
            name: "Ánh nắng của anh",
            singer: "MCK, RPT PhongKhin",
            path: "./music/anhnangcuaanh.mp3",
            image: "./images/anhnangcuaanh.jpg"
        },
        {
            name: "Chưa bao giờ",
            singer: "Trung Quân Idol",
            path: "./music/chuabaogio.mp3",
            image: "./images/chuabaogio.jpg"
        },
        {
            name: "Có em chờ",
            singer: "Min",
            path: "./music/coemcho.mp3",
            image: "./images/coemcho.jpg"
        },
        {
            name: "Dịu dàng em đến",
            singer: "Chi Dân",
            path: "./music/diudangemden.mp3",
            image: "./images/diudangemden.jpg"
        },
        {
            name: "My evething",
            singer: "Tiên Tiên",
            path: "./music/myeverything.mp3",
            image: "./images/myeverything.jpg"
        },
        {
            name: "Sau tất cả",
            singer: "Erik",
            path: "./music/sautatca.mp3",
            image: "./images/sautatca.jpg"
        },
        {
            name: "Yêu 5",
            singer: "Rymatic",
            path: "./music/yeu5.mp3",
            image: "./images/yeu5.jpg"
        },
    ],
    setConfig: function(key, value){
        this.config[key] = value;
        JSON.stringify(localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config)))
    },
    definedProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get(){
                return this.songs[this.currentIndex];
            }
        })
    },
    renderSongs: function(){
        const html = this.songs.map((song, index) => {
            return `
                <div class="song" data-ofset="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = html.join('');
        $$('.playlist .song')[this.currentIndex].classList.add('active');
    },
    handleEvent: function(){
        //Xử lí scroll cd
        const cdWidth = cd.offsetWidth;
        document.onscroll = function(){
            var scrollTop = window.scrollY || document.documentElement.scrollTop;
            var newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //Xử lí nút play song
        _this = this;
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause();
            }else{
                audio.play();
            }
        }

        //Lắng nghe play
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            newCdThumb.play();
        }

        //Lắng nghe pause
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            newCdThumb.pause();
        }

        //Range time
        audio.ontimeupdate = function(){
            if(this.currentTime)
            {
                const progressCurrent = Math.floor(this.currentTime / this.duration * 100);
                progress.value = progressCurrent;
            }
        }

        //Seek time
        progress.oninput = function(e){
            const timeNow = e.target.value * audio.duration / 100;
            audio.currentTime = timeNow;
        }

        //CD Rotate
        const newCdThumb = cdThumb.animate([
            {
                transform: 'rotate(360deg)',
            }
        ], {
            duration: 2000,
            iterations: Infinity,
        })
        newCdThumb.pause();

        //Next song
        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.randomSong();
            }else
            {
                _this.nextSong();
            }
            audio.play();
        }

        //Pre song
        prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.randomSong();
            }else
            {
                _this.prevSong();
            }
            audio.play();
        }

        //Random song
        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom;
            //Save cấu hình
            _this.setConfig('isRandom', _this.isRandom);
            this.classList.toggle('active', _this.isRandom);
        }

        //Ended song
        audio.onended = function(){
            if(_this.isRepeat) audio.play();
            else if(_this.isRandom){
                _this.randomSong();
                audio.play();
            }
            else nextBtn.click();
        }

        //Repeat song
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            //Save cấu hình
            _this.setConfig('isRepeat', _this.isRepeat);
            this.classList.toggle('active', _this.isRepeat);
        }

        //Play song when click
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');
            const songOptionNode = e.target.closest('.option');
            if(songOptionNode){
                console.log(songOptionNode);
            }else if(songNode){
                _this.currentIndex = Number(songNode.getAttribute('data-ofset'));
                _this.loadCurrentSong();
                audio.play();
            }
        }
    },
    loadConfig: function(){
        //Load cấu hình random và repeat
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;

        //Load giao diện random và repeat
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);

        //Object.assign(this, this.config);
    },
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

        //Active song
        const listSong = $$('.playlist .song');
        listSong.forEach(itemSong => {
            itemSong.classList.remove('active');
        })
        listSong[this.currentIndex].classList.add('active');

        //Scroll active song
        this.scrollIntoView();
    },
    nextSong: function(){
        _this.currentIndex++;
        if(_this.currentIndex >= _this.songs.length) _this.currentIndex = 0;
        _this.loadCurrentSong();
    },
    prevSong: function(){
        _this.currentIndex--;
        if(_this.currentIndex < 0) _this.currentIndex = _this.songs.length - 1;
        _this.loadCurrentSong();
    },
    randomSong: function(){
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * _this.songs.length);
        } while(newIndex === _this.currentIndex)
        _this.currentIndex = newIndex;
        _this.loadCurrentSong();
    },
    scrollIntoView: function(){
        setTimeout(() => {
            if(this.currentIndex === 1 || 2 || 3){
                $('.song.active').scrollIntoView({
                    behavior: "smooth", block: "end"
                })
            }else{
                $('.song.active').scrollIntoView({
                    behavior: "smooth", block: "nearest"
                })
            }
        }, 300)
    },
    start: function(){
        //Load config
        this.loadConfig();

        //Định nghĩa current song
        this.definedProperties();

        //Render bài hát
        this.renderSongs();

        //Xử lí sự kiện
        this.handleEvent();

        //Load song
        this.loadCurrentSong();
    }
}
app.start();
