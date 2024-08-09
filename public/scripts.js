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
    
    const videoLinks = document.querySelectorAll('.video-link-item');
    const resultContainer = document.getElementById('searchResults');
    clearSearchResults(); // 検索結果のリストをクリア
    let found = false;
    const seenTitles = new Set(); // 表示済みのタイトルを追跡

    videoLinks.forEach(linkItem => {
        const link = linkItem.querySelector('a');
        const videoTitle = link.textContent.toLowerCase();
        const params = link.getAttribute('onclick').match(/changeVideo\('(.*?)',\s*'(.*?)'(?:,\s*'(.*?)')?\)/);

        if (params) {
            const videoSrc = params[1].toLowerCase();
            const genre1 = params[2] ? params[2].toLowerCase() : '';
            const genre2 = params[3] ? params[3].toLowerCase() : '';

            // 検索条件に一致し、かつまだ表示していない場合
            if ((videoTitle.includes(query) || videoSrc.includes(query) || genre1.includes(query) || genre2.includes(query)) && !seenTitles.has(videoTitle)) {
                const clone = linkItem.cloneNode(true); // クローンを作成
                clone.classList.add('candidate-list-item'); // CSSクラスを追加
                resultContainer.appendChild(clone); // 検索結果のリストに追加
                seenTitles.add(videoTitle); // タイトルを記録
                found = true;
            }
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
        const filename = file.name;

        const data = {
            message: `Add ${filename}`,
            content: fileContent,
            branch: 'main'
        };

        fetch('https://api.github.com/repos/ghostvillager/MyRoom/contents/' + filename, {
            method: 'PUT',
            headers: {
                'Authorization': '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',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                alert('動画がアップロードされました。');
                // 必要に応じて検索リストを更新
                searchVideos(filename);
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



