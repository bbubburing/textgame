import chalk from "chalk";
import readlineSync from "readline-sync";

class Player {
  constructor() {
    this.hp = 100;
    this.attackPowerMin = 9; // 공격력 최소값
    this.attackPowerMax = 14; // 공격력 최대값
  }

  // 플레이어 수치 증가
  increaseStats(stage) {
    const hpIncrease = Math.floor(Math.random() * (stage * 40));
    const attackIncreaseMin = Math.floor(Math.random() * (stage * 7));
    const attackIncreaseMax = Math.floor(Math.random() * (stage * 10));

    this.hp += hpIncrease;
    this.attackPowerMin += attackIncreaseMin;
    this.attackPowerMax += attackIncreaseMax;

    console.log(
      chalk.green(`\n플레이어의 체력이 ${hpIncrease}만큼 증가했습니다.`)
    );
    console.log(
      chalk.green(
        `플레이어의 최소 공격력이 ${attackIncreaseMin}만큼 증가했습니다.`
      )
    );
    console.log(
      chalk.green(
        `플레이어의 최대 공격력이 ${attackIncreaseMax}만큼 증가했습니다.`
      )
    );
    readlineSync.question("\n다음 스테이지로 넘어가려면 엔터 키를 누르세요.");
  }

  attack(monster) {
    // 플레이어의 공격 (최소값과 최대값 사이의 랜덤한 공격력)
    const damage = Math.floor(
      Math.random() * (this.attackPowerMax - this.attackPowerMin + 1) +
        this.attackPowerMin
    );
    monster.hp -= damage;
    return damage;
  }
}

class Monster {
  constructor(stage) {
    this.hp = 100;
    this.attackPower = 3;

    this.hp += Math.floor(Math.random() * (stage * 10));
    this.attackPower += Math.floor(Math.random() * (stage * 5));
  }

  attack(player) {
    // 몬스터의 공격
    const damage = this.attackPower;
    player.hp -= damage;
    return damage;
  }
}

// 스테이지, 플레이어, 몬스터 상태 표시
function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
      chalk.blueBright(
        `| 플레이어 HP : ${player.hp}, Attack : ${player.attackPowerMin}-${player.attackPowerMax} `
      ) +
      chalk.redBright(
        `| 몬스터 HP : ${monster.hp}, Attack : ${monster.attackPower} |`
      )
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

// 배틀
const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    const consecutiveAttackChance = Math.min(23 + stage * 3, 100); // 최대 100%

    console.log(
      chalk.green(
        `\n1. 공격한다 2. 연속 공격 (${consecutiveAttackChance}%) 3. 도망친다`
      )
    );
    const choice = readlineSync.question("당신의 선택은? ");

    // 플레이어의 선택에 따라 다음 행동 처리
    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

    switch (choice) {
      case "1":
        // 기본 공격
        const playerDamage = player.attack(monster);
        logs.push(
          chalk.green(
            `플레이어가 몬스터에게 ${playerDamage}의 피해를 입혔습니다.`
          )
        );

        if (monster.hp > 0) {
          const monsterDamage = monster.attack(player);
          logs.push(
            chalk.red(
              `몬스터가 플레이어에게 ${monsterDamage}의 피해를 입혔습니다.`
            )
          );
        }
        break;

      case "2":
        if (Math.random() * 100 < consecutiveAttackChance) {
          const extraDamage = player.attack(monster);
          logs.push(
            chalk.greenBright(
              `연속공격 성공! 추가로 ${extraDamage}의 피해를 입혔습니다.`
            )
          );
        } else {
          logs.push(chalk.red(`연속공격이 실패했습니다.`));
        }

        if (monster.hp > 0) {
          const monsterDamage = monster.attack(player);
          logs.push(
            chalk.red(
              `몬스터가 플레이어에게 ${monsterDamage}의 피해를 입혔습니다.`
            )
          );
        }
        break;

      case "3":
        if (Math.random() < 0.3) {
          console.log(chalk.yellow(`도망에 성공했습니다. 스테이지 클리어`));
          return; // 도망 성공 시 배틀 종료
        } else {
          logs.push(chalk.red(`도망에 실패했습니다.`));
          const monsterDamage = monster.attack(player);
          logs.push(
            chalk.red(
              `몬스터가 플레이어에게 ${monsterDamage}의 피해를 입혔습니다.`
            )
          );
        }
        break;

      default:
        logs.push(chalk.red("잘못된 선택입니다."));
        break;
    }

    if (player.hp <= 0) {
      console.log(chalk.red("플레이어가 사망했습니다. 게임 오버"));
      process.exit(); // 게임 종료
    }
  }

  // 몬스터 처치 시
  if (monster.hp <= 0) {
    console.log(chalk.green("몬스터를 처치했습니다. 스테이지 클리어"));
  }
};

// 게임 시작 함수
export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);

    // 스테이지 클리어 후 플레이어 수치 증가
    player.increaseStats(stage);
    stage++;

    // 게임 종료 조건
    if (player.hp > 0 && stage > 10) {
      console.log(chalk.green("축하합니다! 모든 스테이지를 클리어했습니다!"));
    }
  }
}
