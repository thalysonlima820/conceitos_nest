import { IsEmail } from 'class-validator';
import { RoutePolicy } from 'src/auth/enum/route-policy.enum';
import { Recado } from 'src/recados/entities/recado.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Pessoa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ length: 50 })
  nome: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @OneToMany(() => Recado, recado => recado.de)
  recadosEnviados: Recado[];

  @OneToMany(() => Recado, recado => recado.para)
  recadosRecebidos: Recado[];

  @Column({ default: true })
  active: boolean;

  @Column({type: 'simple-array', default:[]})
  RoutePolicies: RoutePolicy[]

  @Column({default: ''})
  picture: string;
}
