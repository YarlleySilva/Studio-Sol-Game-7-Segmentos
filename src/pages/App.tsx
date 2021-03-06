import React, { useState, useEffect, useRef } from "react";
import useAppContext from "../hooks/useAppContext";
import api from "./../services/api";
import DisplayNumber from "../components/DisplayNumber";
import DisplayMessage from "../components/DisplayMessage";
import { ico_refresh } from "../components/Icons";
import "./styles.css";

function App() {
  const inputDisable = useRef<HTMLInputElement>(null);
  const btnDisable = useRef<HTMLButtonElement>(null);

  const { randomNumber, setRandomNumber, statusGeral, setStatusGeral } =
    useAppContext();

  const [inputError, setInputError] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    getRandomNumber();
  }, []);

  //Consome API, se der errado cai no Catch
  const getRandomNumber = async () => {
    try {
      const response = await api.get("/rand?min=1&max=300");
      setRandomNumber(response.data.value);
    } catch (e: any) {
      setStatusGeral({
        ...statusGeral,
        StatusErrorNumber: e.response.data.StatusCode,
        StatusMsg: "ERROR",
      });
    }
  };

  //Toda vez que houver mudança no StatusMsg executa a função
  useEffect(() => {
    const convertToDisplayNumber = () => {
      if (statusGeral.StatusMsg) {
        if (statusGeral.StatusMsg === "ERROR") {
          const valueToNumber = Number(statusGeral.StatusErrorNumber); //Convertendo qualquer string em número

          //convertendo para string novamente (remove zeros a esquerda) e dividido em um array de string
          const valueToStringArray = String(valueToNumber).split("");

          setStatusGeral({
            ...statusGeral,
            StatusErrorNumberArray: valueToStringArray,
          });
        }
      }
    };

    convertToDisplayNumber();
  }, [statusGeral.StatusMsg]);

  //Desabilita Input e Button se houver erro ou vencedor
  useEffect(() => {
    if (
      statusGeral.StatusMsg === "WINNER" ||
      statusGeral.StatusMsg === "ERROR"
    ) {
      disableInputAndButton();
    }
  }, [statusGeral.StatusMsg]);

  const disableInputAndButton = () => {
    if (inputDisable.current && btnDisable.current) {
      inputDisable.current.disabled = true;
      btnDisable.current.disabled = true;
    }
  };

  //Aplicação pequena então poderia utilizar sem problemas o simples location.reload();
  //Aplicações maiories, sempre utilizar os Hooks, useState e UseEffect
  const handleReload = () => {
    window.location.reload();
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.replace(/\D/g, "")); //Deixa só digitar Numeros positivos no Input

    setStatusGeral({
      ...statusGeral,
      ValueInput: e.target.value.replace(/\D/g, ""), //Deixa só digitar Numeros positivos no Input
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (statusGeral.ValueInput && inputValue) {
      setInputError(false);
      setInputValue("");

      return compareValueInputWithRandom();
    }

    setInputError(true);
  };

  //Compara o valor Random da API com o digitado no INPUT
  const compareValueInputWithRandom = () => {
    if (randomNumber) {
      if (randomNumber > Number(statusGeral.ValueInput)) {
        const valueToNumber = Number(statusGeral.ValueInput); //Convertendo qualquer string em número
        //convertendo para string novamente (remove zeros a esquerda) e dividido em um array de string
        const valueToStringArray = String(valueToNumber).split("");

        return setStatusGeral({
          ...statusGeral,
          StatusMsg: "HIGHER",
          ValueInputArray: valueToStringArray,
        });
      }

      if (randomNumber < Number(statusGeral.ValueInput)) {
        const valueToNumber = Number(statusGeral.ValueInput); //Convertendo qualquer string em número
        //convertendo para string novamente (remove zeros a esquerda) e dividido em um array de string
        const valueToStringArray = String(valueToNumber).split("");

        return setStatusGeral({
          ...statusGeral,
          StatusMsg: "LOWER",
          ValueInputArray: valueToStringArray,
        });
      }

      if (randomNumber === Number(statusGeral.ValueInput)) {
        const valueToNumber = Number(statusGeral.ValueInput); //Convertendo qualquer string em número
        //convertendo para string novamente (remove zeros a esquerda) e dividido em um array de string
        const valueToStringArray = String(valueToNumber).split("");

        return setStatusGeral({
          ...statusGeral,
          StatusMsg: "WINNER",
          ValueInputArray: valueToStringArray,
        });
      }
    }

    return null;
  };

  return (
    <div className="container">
      <header className="container-header">
        <h2 className="header-title">QUAL É O NÚMERO?</h2>
        <i className="header-divider"></i>
      </header>

      <section className="section-message-display">
        <DisplayMessage statusMsg={statusGeral.StatusMsg} />
      </section>

      <section className="section-display-number">
        {statusGeral.StatusMsg === "ERROR" ? (
          statusGeral.StatusErrorNumberArray &&
          statusGeral.StatusErrorNumberArray.map(
            (erroNumberArraay: string, index: number) => {
              return (
                <DisplayNumber key={index} elementNumber={erroNumberArraay} />
              );
            }
          )
        ) : statusGeral.StatusMsg === "HIGHER" ||
          statusGeral.StatusMsg === "LOWER" ||
          statusGeral.StatusMsg === "WINNER" ? (
          statusGeral.ValueInput &&
          statusGeral.ValueInputArray.map(
            (elementValue: string, index: number) => {
              return <DisplayNumber key={index} elementNumber={elementValue} />;
            }
          )
        ) : (
          <DisplayNumber elementNumber={"10"} />
        )}
      </section>

      <section className="section-btn-new-match">
        {statusGeral.StatusMsg === "WINNER" ||
        statusGeral.StatusMsg === "ERROR" ? (
          <button className="btn-new-match" onClick={handleReload}>
            <i className="btn-new-match-icon">{ico_refresh}</i>
            <span className="btn-new-match-text">NOVA PARTIDA</span>
          </button>
        ) : (
          ""
        )}
      </section>

      <section className="section-form">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-input"
            placeholder="Digite o palpite"
            maxLength={3}
            value={inputValue}
            onChange={handleOnChange}
            ref={inputDisable}
          />
          <button type="submit" className="form-btn-submit" ref={btnDisable}>
            Enviar
          </button>
        </form>

        {inputError && (
          <span className="form-input-empty">
            Informe um palpite, não pode ser vazio.
          </span>
        )}
      </section>
    </div>
  );
}

export default App;
