import { motion } from 'framer-motion';
import type { StackItem } from '../../types/portfolio';
import './StackTable.css';

const stackItems: StackItem[] = [
  { name: 'hyprland', type: 'Compositor', status: 'Active', detail: 'Arch Linux Custom Setup' },
  { name: 'docker-compose', type: 'Orquestación', status: 'Active', detail: 'Multi-container architecture' },
  { name: 'kali-linux', type: 'Security OS', status: 'Active', detail: 'Web Exploitation & Pentesting' },
  { name: 'spring-boot', type: 'Backend', status: 'Active', detail: 'REST APIs & Microservices' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const StackTable = () => {
  return (
    <motion.div 
      className="kctl"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <table>
        <motion.thead variants={rowVariants}>
          <tr>
            <th>Servicio</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Detalle</th>
          </tr>
        </motion.thead>
        <tbody>
          {stackItems.map((item, index) => (
            <motion.tr key={index} variants={rowVariants}>
              <td className="name">{item.name}</td>
              <td>{item.type}</td>
              <td>
                <span className="pill">
                  <span className="status-dot"></span>
                  {item.status}
                </span>
              </td>
              <td>{item.detail}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default StackTable;
