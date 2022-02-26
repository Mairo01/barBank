import {AxiosRequestHeaders} from "axios";

export default function authHeader(): AxiosRequestHeaders {
  const user = JSON.parse(localStorage.getItem("user") as string)

  return user?.token ? {Authorization: "Bearer " + user.token} : {}
}
