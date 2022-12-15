let wordList;
let gameData;

function fetchData(dataset) {
  return fetch(`http://localhost:3001/api/v1/${dataset}`).then(response => response.json()).catch(error => console.log(`${dataset}`,error))
}

function returnDataPromises(){
  const fetchWords = fetchData("words")
  const fetchGames = fetchData("games")

  return Promise.all([fetchWords,fetchGames])
}

