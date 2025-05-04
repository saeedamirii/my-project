class Stage {
  constructor() {
    this.render = () => {
      this.renderer.render(this.scene, this.camera);
    };

    this.add = (elem) => {
      this.scene.add(elem);
    };

    this.remove = (elem) => {
      this.scene.remove(elem);
    };

    this.container = document.getElementById("game");

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor("#D0CBC7", 1);
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const d = 20;
    this.camera = new THREE.OrthographicCamera(
      -d * aspect,
      d * aspect,
      d,
      -d,
      -100,
      1000
    );
    this.camera.position.set(2, 2, 2);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.light = new THREE.DirectionalLight(0xffffff, 0.5);
    this.light.position.set(0, 499, 0);
    this.scene.add(this.light);

    this.softLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.softLight);

    window.addEventListener("resize", () => this.onResize());
    this.onResize();
  }

  setCamera(y, speed = 0.3) {
    TweenLite.to(this.camera.position, speed, {
      y: y + 4,
      ease: Power1.easeInOut,
    });
    TweenLite.to(this.camera.lookAt, speed, { y: y, ease: Power1.easeInOut });
  }

  onResize() {
    const viewSize = 30;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.left = window.innerWidth / -viewSize;
    this.camera.right = window.innerWidth / viewSize;
    this.camera.top = window.innerHeight / viewSize;
    this.camera.bottom = window.innerHeight / -viewSize;
    this.camera.updateProjectionMatrix();
  }
}

class Block {
  constructor(block) {
    this.STATES = { ACTIVE: "active", STOPPED: "stopped", MISSED: "missed" };
    this.MOVE_AMOUNT = 12;
    this.dimension = { width: 0, height: 0, depth: 0 };
    this.position = { x: 0, y: 0, z: 0 };
    this.targetBlock = block;
    this.index = (this.targetBlock ? this.targetBlock.index : 0) + 1;
    this.workingPlane = this.index % 2 ? "x" : "z";
    this.workingDimension = this.index % 2 ? "width" : "depth";

    this.dimension.width = this.targetBlock ? this.targetBlock.dimension.width : 10;
    this.dimension.height = this.targetBlock ? this.targetBlock.dimension.height : 2;
    this.dimension.depth = this.targetBlock ? this.targetBlock.dimension.depth : 10;

    this.position.x = this.targetBlock ? this.targetBlock.position.x : 0;
    this.position.y = this.dimension.height * this.index;
    this.position.z = this.targetBlock ? this.targetBlock.position.z : 0;

    this.colorOffset = this.targetBlock ? this.targetBlock.colorOffset : Math.round(Math.random() * 100);

    if (!this.targetBlock) {
      this.color = 0x333344;
    } else {
      let offset = this.index + this.colorOffset;
      let r = Math.sin(0.3 * offset) * 55 + 200;
      let g = Math.sin(0.3 * offset + 2) * 55 + 200;
      let b = Math.sin(0.3 * offset + 4) * 55 + 200;
      this.color = new THREE.Color(r / 255, g / 255, b / 255);
    }

    this.state = this.index > 1 ? this.STATES.ACTIVE : this.STATES.STOPPED;
    this.speed = -0.1 - this.index * 0.005;
    if (this.speed < -4) this.speed = -4;
    this.direction = this.speed;

    const geometry = new THREE.BoxGeometry(
      this.dimension.width,
      this.dimension.height,
      this.dimension.depth
    );
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(
      this.dimension.width / 2,
      this.dimension.height / 2,
      this.dimension.depth / 2
    ));

    this.material = new THREE.MeshToonMaterial({
      color: this.color,
      shading: THREE.FlatShading,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
  }

  move() {
    this[this.workingPlane] += this.direction;

    if (this[this.workingPlane] <= -15) {
      this.state = this.STATES.MISSED;
    }

    if (this[this.workingPlane] >= this.dimension[this.workingDimension]) {
      this[this.workingPlane] = this.dimension[this.workingDimension];
      this.state = this.STATES.STOPPED;
    }
  }

  reset() {
    this.state = this.STATES.ACTIVE;
    this.position = { x: 0, y: 0, z: 0 };
    this.speed = -0.1;
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
  }
}

let stage;
let blocks = [];
let currentBlock = null;
let score = 0;

function startGame() {
  stage = new Stage();
  createNewBlock();
  document.getElementById("start-button").style.display = 'none';
  document.getElementById("instructions").style.display = 'block';

  function createNewBlock() {
    if (currentBlock) {
      blocks.push(currentBlock);
    }
    currentBlock = new Block(blocks[blocks.length - 1]);
    stage.add(currentBlock.mesh);
  }

  function gameLoop() {
    if (currentBlock) {
      currentBlock.move();
      if (currentBlock.state === currentBlock.STATES.MISSED) {
        endGame();
      }
    }
    requestAnimationFrame(gameLoop);
    stage.render();
  }

  gameLoop();
}

function endGame() {
  document.getElementById("final-score").innerText = score;
  document.getElementById("container").classList.add('ended');
  document.getElementById("score").innerText = "بازی تمام شد";
}

document.getElementById("start-button").addEventListener("click", startGame);
