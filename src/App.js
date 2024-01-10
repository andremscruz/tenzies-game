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
    const [chronometer, setChronometer] = useState(0)
    const [chronometerInterval, setChronometerInterval] = useState(0)

    function play(){
        const audio = new Audio(sound)
        audio.currentTime = 3
        audio.play()
    }
    useEffect(() => {
        const fetchData = async () => {
            try {
                const initialTenzies = await tenzie.getAll()
                setScores(initialTenzies)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchData()
    }, [])
    
    useEffect(() => {
        const firstValue = dice[0].value
        const allHeld = dice.every((die) => die.held)
        const allSameNumber = dice.every((die) => die.value === firstValue)
    
        if (allHeld && allSameNumber) {
          setTenzies(true)
          clearInterval(chronometerInterval) 
        } 
        else if (chronometerInterval === 0 && dice.some((die) => die.held)) {
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
                score: count,
                chronometer: chronometer
                
            }
            tenzie
            .create(scoreObject)
            .then(returnedScore => setScores(scores.concat(returnedScore)))
            .then(setCount(0))
            .then(setName(''))
            .then(setAlert(''))
            .then(setChronometer(0))
            .then(document.location.reload(true))
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
        return `${seconds}.${milliseconds}`
    }

    const sortedTimes = scores.sort((a, b) => a.chronometer - b.chronometer)
    const bestTimes = sortedTimes.slice(0, 3)

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
                    <button className="roll-dice" onClick={rollUnheldDice}>
                        {tenzies ? "Reset Game" : "Roll"}
                    </button>
                    <div>
                        <p >Time: <label className="time">{formatTime(chronometer)}</label> s</p>
                        <p >Your number of rolls: <label className="rolls">{count}</label></p>
                    </div>
                </main>
                <h4 style={{color: 'white'}}>Top Scores:</h4>
                <div className="scores">
                    <div>
                        <h5>Least rolls: {bestScores.map((score, i) => 
                        <p key={score.id}>{i+1}°: {score.name} - <label className="rolls-b">{score.score}</label></p>)}</h5> 
                    </div>
                    <div>
                        <h5>Less time: {bestTimes.map((time, i) =>
                        <p key={time.id}>{i+1}°: {time.name} - <label className="time-b">{formatTime(time.chronometer)}</label></p>)}</h5>
                    </div>
                    
                    
                    
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
