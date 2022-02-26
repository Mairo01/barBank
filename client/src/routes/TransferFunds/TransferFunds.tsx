import {useForm} from "react-hook-form";
import authService from "../../services/authService";
import {TransactionData} from "../../Interfaces";
import {ReactElement} from "react";

export default function TransferFunds(): ReactElement {
  const {register, handleSubmit, setError, formState: {errors, isSubmitSuccessful}, clearErrors} = useForm()
  const errorMsg = (error: string): JSX.Element => <p className="error-message">{errors[error].message}</p>

  function onSubmit(transaction: TransactionData): void {
    authService.transferFunds(transaction)
      .catch(e => { setError('apiError', {message: e.response.data.error}) })
  }

  return (
    <form onSubmit={ handleSubmit(onSubmit) }>
      <input placeholder="Account number"
             {...register("accountTo", {
               required: "Account number is required",
               minLength: {
                 value: 4,
                 message: "Invalid account number format"
               }
             })}
      />
      {errors.accountTo ? errorMsg("accountTo") : ""}

      <input placeholder="Amount" type="number" step={0.01}
             {...register("amount", {
               required: "Amount is required",
               valueAsNumber: true,
               min: {
                 value: 0.01,
                 message: "Minimum amount is 0.01"
               }
             })}
      />
      {errors.amount ? errorMsg("amount") : ""}

      <textarea placeholder="Explanation" rows={4}
             {...register("explanation", {
               required: "Explanation is required",
               minLength: {
                 value: 3,
                 message: "Minimum explanation length is 3 characters"
               }
             })}
      />
      {errors.explanation ? errorMsg("explanation") : ""}

      <input type="submit" value="Initiate transaction" onClick={ () => clearErrors() } />

      {errors.apiError ? errorMsg("apiError") : ""}

      {isSubmitSuccessful ? <p className="success">Transaction sent</p> : ""}
    </form>
  )
}
