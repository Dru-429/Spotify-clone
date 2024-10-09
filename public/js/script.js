console.log("Let's go ....");
let currentSong = new Audio;
let songs;
let currFolder;

//Get all the songs
async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/public/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    console.log(as);
    let songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            let song = element.href.split(`/${folder}/`)[1];
            songs.push(song);
        }
    }

    //Show all the songs in the playlist 
    let song_ul = document.querySelector(".songList").getElementsByTagName("ul")[0];
    song_ul.innerHTML = "";
    const songLinks = {};
    for (const song of songs) {
        let completeName = song.replaceAll("%20", " "); // Replace '%20' with spaces
        completeName = completeName.replaceAll(".mp3", " "); // Remove '.mp3' extension
        const [artist, songName] = completeName.split("-"); // Split by '-'Z
        songLinks[songName.trim()] = song; //fill object with song Name :   Son link to play 
        song_ul.innerHTML = song_ul.innerHTML + `<li>
          <img class="invert-img" src="img/music.svg" alt="music">
          <div class="details">
              <p>${songName.trim()}</p>
              <p class="artist">${artist}</p>
          </div>
          <img class="invert-img play-now" src="img/play.svg" alt="play">
      </li>`
    }

    console.log(songLinks)
    //Play the 10th song on the the list 
    // var audio = new Audio(songs[9]);
    // audio.play();         

    //Attach event listner to each song 
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click', element => {
            const songTitle = e.querySelector(".details").firstElementChild.innerHTML;  // Get the song title
            console.log(songTitle);
            playMusic(songLinks[songTitle], false);  // Use the song title to look up the link in songLinks
        })
    })
    // console.log(songs) ;
    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track).replace('.mp3', " ");
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";


}



function SSToMMSS(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Pad minutes and seconds with leading zeros if necessary
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${paddedMinutes}:${paddedSeconds}`;
}


async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    console.log(div);
    let anchors = div.getElementsByTagName('a');
    console.log(anchors);
    console.log(anchors[5].href);
    // Array.from(anchors).forEach(e=> {
    //     if (e.href.includes("/songs/")){
    //         console.log(e.href) ;
    //     }
    // })

    let array = Array.from(anchors);
    for (let i = 0; i < array.length; i++) {
        if (array[i].href.includes("/songs/")) {
             console.log(array[i].href.split("/").slice(-2)[0]);
            let folder = array[i].href.split("/").slice(-2)[0];
            let response= await fetch(`/songs/${folder}/info.json`);
            document.querySelector(".cardContainer").innerHTML = document.querySelector(".cardContainer").innerHTML + `<div data-folder="${folder}"  class="card">
            <div class="coverimg">
                <div class="playCard">
                    <img src="img/play.svg" alt="play button">
                </div>
                <img src="songs/${folder}/cover.jpg" alt="Cover img">
            </div>
            <h2>${response.title} </h2>
            <p>${response.description}}</p>
        </div>`

        }
    }

    //load the playlist whenever the card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener('click', async (item) => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })

    })

    //Attach an event listner to play
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })

    // ADD an event listner to Previous 
    previous.addEventListener('click', () => {
        // console.log("Privious clicked");
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])    // by split 'songs', 'Artic%20Monkeys%20-%20I%20Wanna%20Be%20Yours.mp3']  we need mp3 part so slice(-1) [0]
        console.log(index)

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    // ADD an event listner to next 
    next.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])    // by split 'songs', 'Artic%20Monkeys%20-%20I%20Wanna%20Be%20Yours.mp3']  we need mp3 part so slice(-1) [0]
        console.log(index)

        if (index < (songs.length - 1)) {
            playMusic(songs[index + 1])
        }
        else {
            playMusic(songs[0], true)
        }
    })

    // Adding event listner to the seek bar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add an event listner to the volume bar 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume outof 100 ", e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100;
        if (e.target.value == 0) {
            volumeBtn.src = "img/mute.svg";
        }
        else {
            volumeBtn.src = "img/volume.svg";
        }
    })
}

async function main() {

    songs = await getSongs("songs/cs");
    // console.log(songs);
    playMusic(songs[0], true);

    //Display all the albums
    displayAlbums();


    // Listen for time update event
    currentSong.addEventListener('timeupdate', () => {
        document.querySelector(".songTime").innerHTML = `${SSToMMSS(currentSong.currentTime)} / ${SSToMMSS(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    //Adding event on hamburger
    document.querySelector(".hamburger").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = "0%";
    })

    //ADDING event listner to  close button 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })


}

main()
