// 動画ファイルリスト
const videoFiles = [
    { src: '動画/僕は小さな淫魔のしもべ 第1話家畜生活の始まり.mp4', genre: 'アニメ' },
    { src: '動画/僕は小さな淫魔のしもべ 第2話 クロエのお食事タイム.mp4', genre: 'アニメ' }
];

// ローカルストレージにデフォルトの動画設定を保存する関数
function setDefaultVideo() {
    const videoFrame = document.getElementById('videoFrame');
    const source = videoFrame.querySelector('source').src;
    const fileName = decodeURIComponent(source.substring(source.lastIndexOf('/') + 1)); // パスからファイル名を取得
    const genre = document.getElementById('currentVideoGenre').textContent.trim();

    if (fileName) {
        localStorage.setItem('defaultVideo', JSON.stringify({ src: fileName, genre: genre }));
        alert(`デフォルト動画が "${fileName}" に設定されました。`);
    } else {
        alert('デフォルト動画の設定に失敗しました。');
    }
}

// ローカルストレージからデフォルト動画を読み込み、設定する関数
function loadDefaultVideo() {
    const defaultVideo = JSON.parse(localStorage.getItem('defaultVideo'));
    if (defaultVideo) {
        changeVideo(defaultVideo.src, defaultVideo.genre);
    } else {
        // デフォルトの動画が設定されていない場合、初期動画をロード
        changeVideo('動画/僕は小さな淫魔のしもべ 第1話家畜生活の始まり.mp4', 'アニメ');
    }
}

// 動画を変更する関数
function changeVideo(src, genre) {
    const videoFrame = document.getElementById('videoFrame');
    videoFrame.querySelector('source').src = src;
    videoFrame.load();

    document.getElementById('currentVideoGenre').textContent = genre;
    document.getElementById('currentVideoGenreContainer').style.display = 'block';
    document.getElementById('noResults').style.display = 'none';
}

// ページが読み込まれた時にデフォルトの動画をロード
window.onload = function() {
    loadDefaultVideo();
    document.getElementById('currentVideoGenreContainer').style.display = 'none'; // 初期表示ではジャンルを非表示
    document.getElementById('searchResultGenreContainer').style.display = 'none'; // 初期表示では検索結果を非表示
};

// ジャンルで動画を検索する関数
function searchVideosByGenre(genre) {
    clearSearchResults();
    searchVideos(genre.toLowerCase());
    document.getElementById('searchResultGenreContainer').style.display = 'block';
    document.getElementById('searchResultGenre').textContent = `現在表示中のジャンル: ${genre}`;
}

// 検索バーで動画を検索する関数
function searchVideos(query = null) {
    if (!query) {
        query = document.getElementById('searchInput').value.toLowerCase();
    }

    if (!query || query.trim() === '') {
        return; // クエリが空の場合、何もしない
    }
    
    const resultContainer = document.getElementById('searchResults');
    clearSearchResults(); // 検索結果のリストをクリア
    let found = false;
    const seenTitles = new Set(); // 表示済みのタイトルを追跡

    videoFiles.forEach(video => {
        const fileName = video.src.split('/').pop().toLowerCase();
        const videoTitle = fileName.replace(/\.mp4$/, '');
        const genre = video.genre.toLowerCase();

        // 検索条件に一致し、かつまだ表示していない場合
        if ((videoTitle.includes(query) || genre.includes(query)) && !seenTitles.has(videoTitle)) {
            const linkItem = document.createElement('div');
            linkItem.classList.add('video-link-item', 'candidate-list-item');

            const link = document.createElement('a');
            link.href = '#';
            link.textContent = videoTitle;
            link.onclick = () => changeVideo(video.src, video.genre);
            
            const genreSpan = document.createElement('span');
            genreSpan.textContent = video.genre;

            linkItem.appendChild(link);
            linkItem.appendChild(genreSpan);
            resultContainer.appendChild(linkItem);

            seenTitles.add(videoTitle);
            found = true;
        }
    });

    if (!found) {
        document.getElementById('noResults').style.display = 'block';
    } else {
        document.getElementById('noResults').style.display = 'none';
        document.getElementById('searchResultGenreContainer').style.display = 'block';
        document.getElementById('searchResultGenre').textContent = `検索結果: ${query}`;
        document.getElementById('currentVideoGenreContainer').style.display = 'none'; // 検索結果がある場合はジャンル表示を非表示
    }
}

// 検索結果をクリアする関数
function clearSearchResults() {
    const resultContainer = document.getElementById('searchResults');
    resultContainer.innerHTML = ''; // 検索結果のリストをクリア
    document.getElementById('searchResultGenreContainer').style.display = 'none'; // 初期表示では検索結果を非表示
}

// デフォルト動画に戻す関数
function resetDefaultVideo() {
    localStorage.removeItem('defaultVideo');
    loadDefaultVideo();
    alert('デフォルト動画に戻しました。');
}

function uploadVideo() {
    const fileInput = document.getElementById('videoFile');
    const file = fileInput.files[0];
    if (!file) {
        alert('動画ファイルを選択してください。');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const fileContent = event.target.result.split(',')[1]; // base64データ部分を取得
        const filename = '動画/' + file.name;

        const data = {
            message: `Add ${filename}`,
            content: fileContent,
            branch: 'main'
        };

        fetch('' + filename, {
            method: 'PUT',
            headers: {
                'Authorization': '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                alert('動画がアップロードされました。');
                searchVideos(filename); // 必要に応じて検索リストを更新
            } else {
                alert('アップロードに失敗しました。');
            }
        })
        .catch(error => {
            console.error('エラーが発生しました:', error);
            alert('アップロード中にエラーが発生しました。');
        });
    };

    reader.readAsDataURL(file);
}
