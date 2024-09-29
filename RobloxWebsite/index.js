function returnJsonToText() {
    return fetch('/Games.json')
        .then(response => response.json())
        .then(data => {
            const jsonString = JSON.stringify(data, null, 2);
            return jsonString; // return the JSON string
        })
        .catch(error => console.error('Error fetching JSON:', error));
}
function nFormatter(num, digits) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
    ];
    const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
    const item = lookup.findLast(item => num >= item.value);
    return item ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol) : "0";
  }
document.addEventListener("DOMContentLoaded", () => {
    const GameHTML = document.getElementById("GameCopy");

    returnJsonToText().then(jsonString => {
        const obj = JSON.parse(jsonString); // Now parse the returned string

        TotalPlaying = 0;
        TotalVisits = 0;
        TotalGames = Object.keys(obj).length-1;

        const fetchPromises = []; // Array to hold all fetch promises

        for (let x = 1; x <= TotalGames; x++) {
            const Game = obj['Game' + x];

            const GameId = Game.GameID;
            const UniverseId = Game.UniverseID;
            const GameBanner = Game.Banner;

            // Clone GameHTML and modify it
            const clone = GameHTML.cloneNode(true);
            clone.querySelector("#link").href = "https://www.roblox.com/games/" + GameId; // Update the link
            clone.querySelector(".GameBanner").src = GameBanner; // Update the banner image

            // Fetch the playing and visiting data
            const fetchPromise = fetch("https://games.roproxy.com/v1/games?universeIds=" + UniverseId)
                .then((response) => response.json())
                .then(data => {
                    const playing = data.data[0].playing.toLocaleString('us', { useGrouping: true });
                    const visits = data.data[0].visits.toLocaleString('us', { useGrouping: true });
                    const name = data.data[0].name.toLocaleString('us', { useGrouping: true });

                    // Update the cloned element's Players and Visits
                    clone.querySelector(".players").innerHTML = nFormatter(parseInt(playing.split(".").join("")), 1); // Set the number of players
                    clone.querySelector(".visits").innerHTML = nFormatter(parseInt(visits.split(".").join("")), 1); // Set the visits
                    clone.querySelector(".GameName").innerHTML = name; // Set the visits

                    // Update TotalVisits
                    TotalVisits += parseInt(visits.split(".").join(""));
                    TotalPlaying += parseInt(playing.split(".").join(""));
                })
                .catch(error => console.error('Error fetching game data:', error));

            fetchPromises.push(fetchPromise); // Add the promise to the array
            document.getElementById("GamesList").appendChild(clone); // Append the clone
        }

        // Wait for all fetch requests to complete
        Promise.all(fetchPromises).then(() => {
            TotalVisits = nFormatter(TotalVisits, 1)
            TotalPlaying = nFormatter(TotalPlaying, 1)

            document.getElementById("Games").innerHTML = TotalGames;
            document.getElementById("Players").innerHTML = TotalPlaying + " +";
            document.getElementById("Visits").innerHTML = TotalVisits + " +";

            // Set title and description
            document.title = obj["Text"].WebName;
            document.getElementById("name").innerHTML = obj["Text"].Name;
            document.getElementById("title").innerHTML = obj["Text"].Title;
            document.getElementById("description").innerHTML = obj["Text"].Description;
            document.getElementById("copyright").innerHTML = obj["Text"].Copyright;

            // Set links
            document.getElementById("Twitter").href = obj["Text"].Twitter;
            document.getElementById("Discord").href = obj["Text"].Discord;
            document.getElementById("Roblox").href = obj["Text"].Roblox;
        });
    });
});
