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


    function play(){
        const audio = new Audio(sound)
        audio.currentTime = 3
        audio.play()
    }
    
    useEffect(() => {
        tenzie.getAll().then(initalTenzies => setScores(initalTenzies))
    },[])

    useEffect(() => {
        const firstValue = dice[0].value
        const allHeld = dice.every(die => die.held)
        const allSameNumber = dice.every(die => die.value === firstValue)
        if(allHeld && allSameNumber) {
            setTenzies(true)
        }
    }, [dice])

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
            play()
        } 
        else if(name.length === 0 ){
            setAlert("Please enter your name")
        } 
        else{
            setDice(allNewDice())
            setTenzies(false)
            const scoreObject = {
                name: name,
                score: count
            }
            tenzie
            .create(scoreObject)
            .then(returnedScore => setScores(scores.concat(returnedScore)))
            .then(setCount(0))
            .then(setName(''))
            .then(setAlert(''))
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

    return (
        <>
            {
                start ? 
                <div>    
                <main>
                    {tenzies && <Confetti />}
                    <h1>Tenzies</h1>
                    <p>Name: <input type="text" value={name} onChange={handleChange}></input></p>
                    <p style = {{color: "red"}}>{alert}</p>
                    <p>Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
                    <div className="die-container">{diceElements}</div>
                    <p>Your number of rolls: {count}</p>
                    <button className="roll-dice" onClick={rollUnheldDice}>
                        {tenzies ? "Reset Game" : "Roll"}
                    </button>
                </main>
                <h4 className="scores">Top Scores(least rolls): {bestScores.map((score, i) => <p key={score.id}>{i+1}°: {score.name} - {score.score}</p> )}</h4> 
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
