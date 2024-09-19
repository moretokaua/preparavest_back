import express from 'express'
import sql from 'mssql'
import {sqlConfig} from "./database.js"
const pool = new sql.ConnectionPool(sqlConfig)
await pool.connect();

const router = express.Router()

 // rota de login
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

// rota de cadastro
router.post('/user/novo', async(req, res)=>{
    try{
        const {email, senha} = req.body;
        console.log(email, senha)
        if(email != null && email != "" && senha != null && senha != "")
        {
            // Verifica se o email já está cadastrado
            const userExists = await pool.query`SELECT * FROM usuario WHERE email = ${email}`;
            
            if (userExists.recordset.length > 0) {
                return res.status(409).json('Email já cadastrado!');
            }

            // Insere o novo usuário se o email não estiver cadastrado
            await pool.query`INSERT INTO usuario (email, senha) VALUES (${email}, ${senha})`;
            return res.status(200).json('Cadastrado com sucesso');
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

//avatar
router.put('/user/avatar', async (req, res) => {
    try {
        const { userId, avatarId } = req.body;
        
        if (!userId || !avatarId) {
            return res.status(400).json("Bad request: Missing userId or avatarId");
        }

        const avatarExists = await pool.query`SELECT * FROM avatar WHERE avatarId = ${avatarId}`;
        
        if (avatarExists.recordset && avatarExists.recordset.length === 0) {
            return res.status(404).json('Avatar não encontrado');
        }

        const userExists = await pool.query`SELECT * FROM usuario WHERE id = ${userId}`;
        if (userExists.recordset && userExists.recordset.length === 0) {
            return res.status(404).json('Usuário não encontrado');
        }

        await pool.query`UPDATE usuario SET avatarId = ${avatarId} WHERE id = ${userId}`;
        
        return res.status(200).json('Avatar atualizado com sucesso');
    } catch (error) {
        return res.status(500).json('Erro no servidor ao atualizar o avatar');
    }
});

    // // Rota para buscar provas por nome e ano no corpo da requisição
    // router.get('/provas', async (req, res) => {
    //     try {
    //         const { prova, ano, link } = req.body; // Obter parâmetros do corpo da requisição

    //         if (!prova || !ano || !link) {
    //             return res.status(400).json("Bad request: Missing nome or ano");
    //         }

    //         const { recordset } = await pool.query`SELECT prova, ano, link FROM provas WHERE id = ${id}`;
            
    //         if (recordset.length === 0) {
    //             return res.status(404).json('Nenhuma prova encontrada para os parâmetros fornecidos');
    //         }

    //         return res.status(200).json(recordset);
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json('Erro no servidor ao buscar provas');
    //     }
    // });


export default router
