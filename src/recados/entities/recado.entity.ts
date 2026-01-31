import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Recado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  texto: string;

  @Column({ default: false })
  lido: boolean;

  @Column()
  data: Date;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  //muitos recados podem ser enviado por uma anica pessoa (emissor)
  @ManyToOne(() => Pessoa, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  //especifica a coluna 'de' que armazena o ID da pessoa que enviou o recado
  @JoinColumn({ name: 'de' })
  de: Pessoa;

  //muitos recados podem ser enviado para uma anica pessoa (destinatario)
  @ManyToOne(() => Pessoa, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  //especifica a coluna 'para' que armazena o ID da pessoa que enviou o recado
  @JoinColumn({ name: 'para' })
  para: Pessoa;
}
