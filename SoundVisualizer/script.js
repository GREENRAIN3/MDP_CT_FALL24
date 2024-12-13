// 设置 Pexels API 密钥
const PEXELS_API_KEY = "AWFhET5AsmuvfnHlJBAvbDkjBrjxa3KPU8bYEL8YRiRGG5nQ5UEJQmyr";

// 获取随机音乐类型
async function fetchGenre() {
    const url = "https://binaryjazz.us/wp-json/genrenator/v1/genre/";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error fetching genre: ${response.status}`);
        const genre = await response.text();
        return genre.trim(); // 返回生成的音乐类型
    } catch (error) {
        console.error("Error fetching genre:", error);
        return "Unknown Genre";
    }
}

// 获取随机故事
async function fetchStory() {
    const url = "https://binaryjazz.us/wp-json/genrenator/v1/story/";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error fetching story: ${response.status}`);
        const story = await response.text();
        return story.trim(); // 返回生成的故事
    } catch (error) {
        console.error("Error fetching story:", error);
        return "Unknown Story";
    }
}

// 使用 Pexels API 搜索图片
async function fetchPexelsImage(keyword) {
    const url = `https://api.pexels.com/v1/search?query=${keyword}&per_page=15&page=1`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching images: ${response.status}`);
        }

        const data = await response.json();

        // 随机选择一张图片
        if (data.photos.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.photos.length);
            const photo = data.photos[randomIndex];
            return {
                url: photo.src.large, // 图片 URL
                photographer: photo.photographer, // 摄影师名字
                photographer_url: photo.photographer_url // 摄影师链接
            };
        } else {
            throw new Error("No images found for the given keyword.");
        }
    } catch (error) {
        console.error("Error fetching image:", error);
        return {
            url: "https://via.placeholder.com/300", // 占位符图片
            photographer: "Unknown",
            photographer_url: "#"
        };
    }
}

// 更新 Genre 和 Description
async function updateGenreAndDescription() {
    const genreElement = document.getElementById("genre");
    const descriptionElement = document.getElementById("description");

    // 设置加载状态
    genreElement.innerText = "Loading...";
    descriptionElement.innerText = "Loading...";

    const [genre, story] = await Promise.all([fetchGenre(), fetchStory()]);

    genreElement.innerText = genre;
    descriptionElement.innerText = story;
}

// 搜索专辑封面
async function searchImage() {
    const keyword = document.getElementById("keyword").value.trim();
    const albumCover = document.getElementById("albumCover");
    const photographerDisplay = document.getElementById("photographer");

    if (!keyword) {
        alert("Please enter a keyword.");
        return;
    }

    // 设置加载状态
    albumCover.src = "";
    photographerDisplay.innerHTML = "Loading...";

    const image = await fetchPexelsImage(keyword);

    // 显示图片和摄影师信息
    albumCover.src = image.url;
    photographerDisplay.innerHTML = `Photo by <a href="${image.photographer_url}" target="_blank">${image.photographer}</a>`;
}

// 绑定事件
document.getElementById("searchImage").addEventListener("click", searchImage);
document.getElementById("generateAlbum").addEventListener("click", updateGenreAndDescription); // 绑定 Generate Album 按钮

// 页面加载时生成 Genre 和 Description
document.addEventListener("DOMContentLoaded", updateGenreAndDescription);

// 获取 Documentation 按钮和弹窗
const documentationBtn = document.getElementById("documentation");
const documentationPopup = document.getElementById("documentationPopup");
const closePopupBtn = document.getElementById("closePopup");

// 点击 Documentation 按钮时显示弹窗
documentationBtn.addEventListener("click", () => {
    documentationPopup.style.display = "flex";
});

// 点击关闭按钮时隐藏弹窗
closePopupBtn.addEventListener("click", () => {
    documentationPopup.style.display = "none";
});

// 点击弹窗背景时隐藏弹窗
documentationPopup.addEventListener("click", (event) => {
    if (event.target === documentationPopup) {
        documentationPopup.style.display = "none";
    }
});