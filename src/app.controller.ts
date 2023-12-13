import { Body, Controller, Get, Param, Post, Render, Res } from '@nestjs/common';
import * as mysql from 'mysql2';
import { AppService } from './app.service';
import { Response } from 'express';
import { UjSutemenyDto } from './UjSutemenyDto';
import { modositSutemenyDto } from './ModositSutemenyDto';

const conn = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || '14s_ismetles',
}).promise();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async index() {

    const [ adatok ] = await conn.execute('SELECT id, nev, ar, leiras FROM sutemeny');

    return { 
      sutemenyek: adatok,
    };
  }

  @Get('/torlesSutemeny/:id')
  async torlesSutemeny (@Res() res: Response, @Param('id') id: number) 
  {
    const [ adatok ] = await conn.execute('DELETE FROM sutemeny WHERE id = ?', [id]);
    res.redirect('/');
  }

  @Get('/modositSutemeny/:id')
  @Render('modositSutemeny')
  async modositSutemenyGet(@Param('id') id: number) {
    const [ adatok ] = await conn.execute('SELECT id, nev, ar, leiras FROM sutemeny WHERE id = ?', [id]);
  
    return {
      nev: adatok[0].nev,
      ar: adatok[0].ar,
      leiras: adatok[0].leiras,
      messages: '',
    };
  }

  @Post('/modositSutemeny/:id')
  @Render('modositSutemeny')
  async modositSutemeny(@Res() res: Response, @Body() modositSutemenyDto: any, @Param('id') id: number) {
    const nev = modositSutemenyDto.nev;
    const ar = modositSutemenyDto.ar;
    const leiras = modositSutemenyDto.leiras;

    if(nev == "" || leiras == "" || ar.toString() == "") {
      return { messages: "Minden mezőt kötelező kitölteni!"};
    } else if (ar < 0) {
      return { messages: "Az ár nem lehet negatív!"};
    } else {
      const [ adatok ] = await conn.execute('UPDATE sutemeny SET nev=?, ar=?, leiras=? WHERE id=?', [nev, ar, leiras, id]);
        res.redirect(`/sutemenyek/${id}`);
    }
  }

  @Get('/sutemenyek/:id')
  @Render('sutemeny')
  async egySuti(@Param('id') id: number) {
    const [ adatok ] = await conn.execute(
      'SELECT id, nev, ar, leiras FROM sutemeny WHERE id = ?',
      [id],
    );
    return adatok[0];
  }

  @Get('/ujSutemeny')
  @Render('ujsutemeny')
  ujSutemeny() {
    return { messages: '' };
  }

  @Post('/ujSutemeny')
  @Render('ujsutemeny')
  async ujSuti(@Body() ujSuti: UjSutemenyDto, @Res() res: Response) {
    const nev = ujSuti.nev;
    const ar = ujSuti.ar;
    const leiras = ujSuti.leiras;
    const [ adatok ] = await conn.execute(
      'INSERT INTO sutemeny (nev, ar, leiras) VALUES (?, ?, ?)',
      [nev, ar, leiras],
    );
    console.log(adatok);
    res.redirect('/');
  }
}
