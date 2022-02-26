import { useForm } from "react-hook-form";
import authService from "../../services/authService";
import {RegisterData} from "../../Interfaces";
import {useNavigate} from "react-router-dom";
import {ReactElement} from "react";

export default function Form(): ReactElement {
  const navigate = useNavigate()
  const {register, handleSubmit, setError, formState: {errors}, clearErrors} = useForm()
  const errorMsg = (error: string): JSX.Element => <span className="error-message"> {errors[error].message} </span>

  function onSubmit(user: RegisterData): void {
    authService.register(user)
      .then(() => navigate("/login"))
      .catch(e => setError("apiError", { message: e.response.data.error }))
  }

  return (
    <form onSubmit={ handleSubmit(onSubmit) }>

      <input placeholder="Full Name"
             {...register("fullName", {
               required: "Full name is required",
               minLength: {
                 value: 2,
                 message: "Minimum name length is 2 characters"
               },
               maxLength: {
                 value: 255,
                 message: "Maximum name length is 255 characters"
               },
             })}
      />
      {errors.fullName ? errorMsg("fullName") : ""}

      <input placeholder="Username"
             {...register("username", {
               required: "Username is required",
               minLength: {
                 value: 2,
                 message: "Minimum username length is 2 characters"
               },
               maxLength: {
                 value: 255,
                 message: "Maximum username length is 255 characters"
               },
             })}
      />
      {errors.username ? errorMsg("username") : ""}

      <input placeholder="Password" type="password"
             {...register("password", {
               required: "Password is required",
               minLength: {
                 value: 8,
                 message: "Minimum password length is 8 characters"
               },
               maxLength: {
                 value: 255,
                 message: "Maximum password length is 255 characters"
               },
             })}
      />
      {errors.password ? errorMsg("password") : ""}

      {errors.apiError ? errorMsg("apiError") : ""}

      <input type="submit" value="Register" onClick={ () => clearErrors() }/>
    </form>
  )
}
