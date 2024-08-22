import express from 'express'
import sql from 'mssql'
import {sqlConfig} from "./database.js"
const pool = new sql.ConnectionPool(sqlConfig)
await pool.connect();

const router = express.Router()

router.get('/materia/:id', async (req, res)=>{
    try{
         const { id } = req.params
         const { recordset } =  await pool.query`select * from questoes where materia = ${id}`
         return res.status(200).json(recordset)
    }
    catch(error){
         return res.status(501).json('ops...algo deu errado')
    }
 })

 router.get('/questao/:materia', async (req, res)=> {
    try{
        const { materia } = req.params
        const { recordset } = await pool.query`select q.id, q.enunciado, q.materia,a.id_questao, a.a, a.b, a.c, a.d, a.e, a.correta from questoes as q
                                                inner join alternativas as a
                                                on a.id_questao = q.id
                                                where q.materia = ${materia}`
        return res.status(200).json(recordset)
    }
    catch(error){
        return res.status(501).json('Algo deu errado!')
    }
 })

router.post('/login', async (req, res)=>{
    try {
        const { email, senha } = req.body;
        if(email != null && email != "" && senha != null && senha != "")
        {
            const { recordset } = await pool.query`select id from usuario where email = ${email} and senha = ${senha}`;
            if(recordset.length == 0)
            {
                return res.status(401).json('usuario ou senha incorreta')
            }

            return res.status(200).json(recordset)
        }
            return res.status(400).json("bad request")

    } 
    catch (error){
        console.log(error)
        return res.status(500).json('Error on server!')
    }
})

router.post('/user/novo', async(req, res)=>{
    try{
        const {email, senha} = req.body;
        console.log(email, senha)
        if(email != null && email != "" && senha != null && senha != "")
        {
            await pool.query`insert into usuario values(${email}, ${senha})`
            return res.status(200).json('Cadastrado com sucesso')
        }
        return res.status(400).json("bad request") 

    }
    catch(error){
        //2627 é o code number padrão no SQL Server para violação de
        //registro unico, nesse caso a pessoa esta tentando inserir um email ja cadastrado
        if(error.number == 2627)
        {
            return res.status(409).json('Email ja cadastrado!')
        }
        return res.status(500).json('Error on server!')
    }
})

export default router