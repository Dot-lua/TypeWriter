
async function test() {
    console.log("Sleep")
    await Sleep(1000)
    console.log("Wait")
    await Wait(1)
    console.log("Done")
    Import("me.corebyte.test.Wait")
}
test()