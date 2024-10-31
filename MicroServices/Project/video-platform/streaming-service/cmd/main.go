package main
import (
    "log"
    "net/http"
    "github.com/gorilla/mux"
)

func main() {
    r := mux.NewRouter()
    log.Fatal(http.ListenAndServe(":8090", r))
}
