export default class RomBuffer{
    constructor(fileContents){
        this.data =[]

        const buffer = fileContents

        for(let i =0; i< buffer.length;i+=2){
            console.log(buffer[i])
            this.data.push((buffer[i] << 8)| (buffer[i+1]<<0))
            //    console.log(buffer[i],buffer[i]<<8)
        }
        
    }
}
// module.exports = RomBuffer
