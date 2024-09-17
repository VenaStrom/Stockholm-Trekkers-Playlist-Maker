
const templateEpisode = document.querySelector(".episode-template.hidden");
const blocks = document.querySelectorAll(".block");

const createEpisodeDOM = (parent) => {
    const episode = templateEpisode.cloneNode(true);
    episode.classList.add("episode");
    episode.classList.remove("episode-template");
    episode.classList.remove("hidden");

    parent.appendChild(episode);
};