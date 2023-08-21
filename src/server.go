package main

import (
	"encoding/json"
	"net/http"
	"os"
	"time"
	"github.com/hugolgst/rich-go/client"
	"github.com/hugolgst/rich-go/ipc"
)

const clientId = "1142840799738986556"
const ytMusicUrl = "https://music.youtube.com/watch?v="

type Body struct {
  Title string `json:"title"`
  Artist string `json:"artist"`
  Artwork string `json:"artwork"`
  Album string `json:"album"`
  Current int64 `json:"current"`
  End int64 `json:"end"`
  Id *string `json:"id"`
}

func handler(w http.ResponseWriter, r *http.Request) {
  if r.Method != "POST" {
    w.WriteHeader(http.StatusMethodNotAllowed)
    w.Write([]byte("Method Not Allowed"))
    return
  }

  var body Body

  err := json.NewDecoder(r.Body).Decode(&body)

  if err != nil {
    w.WriteHeader(http.StatusUnsupportedMediaType)
    w.Write([]byte("Unsupported Media Type"))
    return
  }

  if body.Id != nil {
    timestamp := time.Now().UnixMilli()
    startTimestamp := timestamp - body.Current
    endTimestamp := startTimestamp + body.End
  
    // зачем то нужно переделывать опять в time.Time несмотря на то библиотека делает int64 =/
    startTime := time.UnixMilli(startTimestamp)
    endTime := time.UnixMilli(endTimestamp)
  
    client.SetActivity(client.Activity{
      State: body.Artist,
      Details: body.Title,
      LargeImage: body.Artwork,
      LargeText: body.Album,
      Timestamps: &client.Timestamps{
        Start: &startTime,
        End: &endTime,
      },
      Buttons: []*client.Button{
        {
          Label: "Слушать",
          Url: ytMusicUrl + *body.Id,
        },
      },
    })

    w.WriteHeader(http.StatusCreated)
    w.Write([]byte("Created"))
    return
  }

  // что за калище меня вынуждает это говно делать
  payload, err := json.Marshal(client.Frame{
    Cmd: "SET_ACTIVITY",
    Args: client.Args{
      Pid: os.Getpid(),
      Activity: nil,
    },
    Nonce: "hi",
  })

  if err != nil {
    panic(err)
  }

  ipc.Send(1, string(payload))

  w.WriteHeader(http.StatusOK)
  w.Write([]byte("OK"))
}

func main() {
  err := client.Login(clientId)

  if err != nil {
    panic(err)
  }

  http.HandleFunc("/", handler)

  err = http.ListenAndServe(":32484", nil)

  if err != nil {
    panic(err)
  }
}