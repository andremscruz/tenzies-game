import React, { useState, useEffect } from "react"
import Confetti from "react-confetti"
import Die from "./Die"
import tenzie from "./service/tenzies"
import sound from "./assets/brasileirinho.mp3"


function App() {
    const [dice, setDice] = useState(allNewDice())
    const [tenzies, setTenzies] = useState(false)
    const [count, setCount] = useState(0)
    const [scores, setScores] = useState([])
    const [name, setName] = useState("")
    const [alert, setAlert] = useState("")
    const [start, setStart] = useState(false)
    const [chronometer, setChronometer] = useState(0);
    const [chronometerInterval, setChronometerInterval] = useState(null)

    function play(){
        const audio = new Audio(sound)
        audio.currentTime = 3
        audio.play()
    }
    useEffect(() => {
        tenzie.getAll().then(initialTenzies => setScores(initialTenzies))
    }, [])
    
    useEffect(() => {
        const firstValue = dice[0].value;
        const allHeld = dice.every((die) => die.held);
        const allSameNumber = dice.every((die) => die.value === firstValue)
    
        if (allHeld && allSameNumber) {
          setTenzies(true)
          clearInterval(chronometerInterval) 
        } else if (
          chronometerInterval === null &&
          dice.some((die) => die.held)
        ) {
          const intervalId = setInterval(
            () => setChronometer((prev) => prev + 0.01),
            10
          )
          setChronometerInterval(intervalId)
        }
      }, [dice, chronometerInterval])

    function handleClick(){
        setStart(prevStart => !prevStart)
        play()
    }

    function handleChange(event){
        setName(event.target.value)
    }
    
    function randomDieValue() {
        return Math.ceil(Math.random() * 6)
    }

    function allNewDice() {
        const newArray = []
        for(let i = 0; i < 10; i++) {
            const newDie = {
                value: randomDieValue(),
                held: false,
                id: i + 1
            }
            newArray.push(newDie)
        }
        return newArray
    }

    function rollUnheldDice() {
        if (!tenzies) {
            setDice((oldDice) => oldDice.map((die, i) =>
                die.held ? 
                    die : 
                    { value: randomDieValue(), held: false, id: i + 1 }
            ))
            setCount(prevCount => prevCount + 1)
        } 
        else if(name.length === 0 ){
            setAlert("Please enter your name")
        } 
        else{
            setDice(allNewDice())
            setTenzies(false)
            const scoreObject = {
                name: name,
                time: chronometer,
                score: count
                
            }
            tenzie
            .create(scoreObject)
            .then(returnedScore => setScores(scores.concat(returnedScore)))
            .then(setCount(0))
            .then(setName(''))
            .then(setAlert(''))
            .then(setChronometer(0))
        }
    }

    function holdDice(id) {
        setDice(prevDice => prevDice.map(die => 
            die.id === id ? 
                {...die, held: !die.held} : 
                die
        ))
    }

    const diceElements = dice.map(die => 
        <Die key={die.id} {...die} hold={() => holdDice(die.id)} />
    )
    
    const sortedScores = scores.sort((a, b) => a.score - b.score)
    const bestScores = sortedScores.slice(0, 3)

    const formatTime = (time) => {
        const seconds = Math.floor(time)
        const milliseconds = Math.floor((time - seconds) * 1000)
        return `${seconds}s ${milliseconds}ms`
    }

    return (
        <>
            {
                start ? 
                <div>    
                <main>
                    {tenzies && <Confetti />}
                    <h1>Tenzies</h1>
                    <p><input placeholder="Please enter your name" type="text" value={name} onChange={handleChange}></input></p>
                    <p style = {{color: "red"}}>{alert}</p>
                    <p>Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
                    <div className="die-container">{diceElements}</div>
                    <div>
                        <p>Time: {formatTime(chronometer)}</p>
                        <p>Your number of rolls: {count}</p>

                    </div>
                    
                    <button className="roll-dice" onClick={rollUnheldDice}>
                        {tenzies ? "Reset Game" : "Roll"}
                    </button>
                </main>
                <div>
                    <h4 className="scores">Top Scores(least rolls): {bestScores.map((score, i) => 
                    <p key={score.id}>{i+1}°: {score.name} - {score.score}</p> )}</h4> 
                    
                </div>
                
                </div>
                :
                <div className="div-play">
                    <button className="play-game" onClick={handleClick}>Play</button> 
                </div>
                
            } 
        </>
    )
}

export default App
