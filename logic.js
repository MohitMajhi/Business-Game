
let p1=0;
let p2=0;
function rollDice1()
{
    const randomNum1 = Math.floor(Math.random()*6)+1;
    const randomNum2 = Math.floor(Math.random()*6)+1;
    document.getElementById('result1').innerText = `Dice 1: ${randomNum1} \n Dice 2: ${randomNum2}`;        
    console.log(randomNum1+randomNum2)

    if(p1<36 && (p1+randomNum1+randomNum2)<36)
    {
        p1=p1+randomNum1+randomNum2
    }
    else
    {
        p1=(p1+randomNum1+randomNum2)-36
    }

    console.log("Position:" + p1);

    document.getElementById("player1").disabled = true;
    document.getElementById("player2").disabled = false;

}
function rollDice2()
{
    
    const randomNum1 = Math.floor(Math.random()*6)+1;
    const randomNum2 = Math.floor(Math.random()*6)+1;
    document.getElementById('result2').innerText = `Dice 1: ${randomNum1} \n Dice 2: ${randomNum2}`;        
    console.log(randomNum1+randomNum2)

    if(p2<36 && (p2+randomNum1+randomNum2)<36)
    {
        p2=p2+randomNum1+randomNum2
    }
    else
    {
        p2=(p2+randomNum1+randomNum2)-36
    }

    console.log("Position:" + p2);
    document.getElementById("player1").disabled = false;
    document.getElementById("player2").disabled = true;
}
