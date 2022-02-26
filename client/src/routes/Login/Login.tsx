import { useForm } from "react-hook-form";
import authService from "../../services/authService";
import {LogInData} from "../../Interfaces";
import {ReactElement} from "react";

export default function Login(): ReactElement {
  const {register, handleSubmit, setError, formState: {errors}, clearErrors} = useForm()
  const errorMsg = (error: string): JSX.Element => <span className="error-message">{ errors[error].message }</span>

  function onSubmit(user: LogInData): void {
    authService.logIn(user)
      .then(r => {
        localStorage.setItem("user", JSON.stringify(r.data));
        window.location.href="/current"
      })
      .catch(e => setError('apiError', { message: e.response.data }))
  }

  return (
    <form onSubmit={ handleSubmit(onSubmit) }>

      <input placeholder="Username"
             {...register("username", { required: "Username is required" })}
      />

      <input placeholder="Password" type="password"
             {...register("password", { required: "Password is required" })}
      />

      <input type="submit" value="Login" onClick={ () => clearErrors() }/>

      {errors.apiError ? errorMsg("apiError") : ""}
    </form>
  )
}
